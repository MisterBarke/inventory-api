import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Items } from '@prisma/client';
import { connect } from 'http2';
import { AddItemDto } from 'src/auth/dto/addItem.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemsService {
    constructor(private prisma: PrismaService) { }


    async getModifiedFields(oldItem: Partial<Items>, updatedItem: Partial<Items>) {
      const modifiedFields: Record<string, any> = {};
    
      for (const key in updatedItem) {
        if (oldItem[key] !== updatedItem[key]) {
          modifiedFields[key] = {
            old: oldItem[key],
            new: updatedItem[key],
          };
        }
      }
    
      return modifiedFields;
    }

    
    async addItem(dto: AddItemDto, userId: string, categoryId: string) {
        const connectedUser = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })
        const existingItem = await this.prisma.items.findUnique({
            where: {
                name: dto.name,
                categoryId: categoryId
            }
        })
        if (existingItem) {
            throw new BadRequestException('Une catégorie avec ce nom existe déjà');
        }

        const itemsTotal = dto.quantity * dto.unitPrice;

        const newItem = await this.prisma.items.create({
            data: {
                name: dto.name,
                createdBy: {
                    connect: {
                        id: connectedUser?.id
                    }
                },
                category: { connect: { id: categoryId } },
                quantity: dto.quantity,
                unitPrice: dto.unitPrice,
                itemsTotal: itemsTotal
            }

        });

        const addedFields = {
          name: newItem.name,
          quantity: newItem.quantity,
          unitPrice: newItem.unitPrice
      };

        await this.prisma.history.create({
          data: {
              itemId: newItem.id,
              quantity: newItem.quantity,
              userId: userId,
              action: "Added",
              newValue: addedFields,
              oldValue: {}
          }
      });
      await this.updateTotals(categoryId);

        return newItem;
    }
    async updateItemTotal(itemId: string) {
        const item = await this.prisma.items.findUnique({
            where: { id: itemId },
            select: { quantity: true, unitPrice: true }
        });
    
        if (!item) {
            throw new NotFoundException('Item not found');
        }
    
        const updatedTotal = (item.quantity || 0) * (item.unitPrice || 0);
    
        await this.prisma.items.update({
            where: { id: itemId },
            data: { itemsTotal: updatedTotal }
        });
    }

    async updateTotals(categoryId: string) {
        const total = await this.prisma.items.aggregate({
            _sum: { itemsTotal: true },
            where: { categoryId: categoryId }
        });

        await this.prisma.categories.update({
            where: { id: categoryId },
            data: { total: total._sum.itemsTotal || 0 }
        });
    }

    async deleteItem(itemId: string, categoryId: string, userId: string) {

        const deletedItem = await this.prisma.items.delete({ where: { id: itemId } });
        const connectedUser = await this.prisma.users.findUnique({
          where:{id: userId}
        })
        if (!connectedUser) {
          throw new NotFoundException("User not found");
        }
        const deletedFields = {
          name: deletedItem.name,
          quantity: deletedItem.quantity,
          unitPrice: deletedItem.unitPrice,
          user:{
            userName: connectedUser?.name,
            userId: connectedUser?.id
          },
      };

        await this.prisma.history.create({
          data: {
              itemId: deletedItem.id,
              userId: connectedUser.id,
              action: "Deleted",
              newValue: {},
              oldValue: deletedFields,
              
          }
      });
        
        await this.updateTotals(categoryId);
        return deletedItem
    }

    async updateItem(itemId: string, categoryId: string, updateData: Partial<Items>, userId: string) {
      const connectedUser = await this.prisma.users.findUnique({
          where: { id: userId }
      });
  
      if (!connectedUser) {
          throw new NotFoundException("User not found");
      }
  
      const oldItem = await this.prisma.items.findUnique({
          where: { id: itemId }
      });
  
      if (!oldItem) {
          throw new NotFoundException("Item not found");
      }
  
      // ✅ Définition des champs autorisés à être modifiés
      const allowedFields = ["name", "quantity", "unitPrice"]; // Liste des champs modifiables
      const filteredUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([key, value]) => 
              allowedFields.includes(key) && value !== undefined && value !== oldItem[key]
          )
      );
  
      // 📌 Si aucun champ n'est réellement modifié, ne pas faire de mise à jour
      if (Object.keys(filteredUpdateData).length === 0) {
          throw new BadRequestException("No changes detected");
      }
  
      // ✅ Mettre à jour uniquement les champs modifiés
      const updatedItem = await this.prisma.items.update({
          where: { id: itemId },
          data: filteredUpdateData
      });
  
      // 📌 Récupérer les différences pour l'historique
      const modifiedFields = Object.fromEntries(
          Object.entries(filteredUpdateData).map(([key, newValue]) => [key, { old: oldItem[key], new: newValue }])
      );
  
      // ✅ Enregistrer les modifications dans l'historique
      await this.prisma.history.create({
          data: {
              itemId,
              userId,
              action: "Updated",
              oldValue: JSON.stringify(Object.fromEntries(Object.entries(modifiedFields).map(([key, val]) => [key, val.old]))),
              newValue: JSON.stringify(Object.fromEntries(Object.entries(modifiedFields).map(([key, val]) => [key, val.new]))),
          }
      });
  
      await this.updateItemTotal(itemId);
      await this.updateTotals(categoryId);
  
      return updatedItem;
  }

    async getAllItems (userId: string){
       const connectedUser = await this.prisma.users.findUnique({
        where:{id:userId}   
       })
       const allItems = await this.prisma.items.findMany({
        where:{
            createdBy:{
                id: connectedUser?.id
            }
        }
       })
       return allItems
    }

    async getOneItem (userId: string, itemId: string){
      const connectedUser = await this.prisma.users.findUnique({
       where:{id:userId}   
      })
      const item = await this.prisma.items.findUnique({
       where:{
        id: itemId,
           createdBy:{
               id: connectedUser?.id
           }
       }
      })
      return item
   }

              async removeFromStock(itemId: string, quantityToRemove: number, userId: string, categoryId: string) {
                const connectedUser = await this.prisma.users.findUnique({
                  where:{id: userId}
                })
                if (!connectedUser) {
                  throw new NotFoundException("User not found");
                }
                  if (!itemId) {
                      throw new BadRequestException('L\'ID de l\'article est requis');
                  }
                  
                  const item = await this.prisma.items.findUnique({
                    where: { id: itemId },
                  });
                
                  if (!item) {
                    throw new NotFoundException('Item not found');
                  }
                
                  if (!item.quantity || item.quantity < quantityToRemove) {
                    throw new BadRequestException('Not enough stock available');
                  }
                
                  
                  const updatedItem = await this.prisma.items.update({
                    where: { id: itemId },
                    data: {
                      quantity: item.quantity - quantityToRemove,
                      itemsTotal: (item.quantity - quantityToRemove) * (item.unitPrice || 0),
                    },
                  });
                  await this.updateItemTotal(itemId);
                  await this.updateTotals(categoryId);

              
                  await this.prisma.history.create({
                    data: {
                      action: 'Retirer',
                      itemId,
                      quantity: quantityToRemove,
                      userId: connectedUser.id,
                      oldValue: { quantity: item.quantity },
                      newValue: { quantity: updatedItem.quantity },
                    },
                  });
                
                  return updatedItem;
                }
                
      async getHistory(userId: string) {
        const connectedUser = await this.prisma.users.findUnique({
          where:{id: userId}
        })
        return this.prisma.history.findMany({
          where:{
            userId: connectedUser?.id
          },
          include: {
            item: true, 
            user: {
              select: {
                id: true,
                name: true, 
              },
            },
            
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      
}
