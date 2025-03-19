import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HistoryAction, Items } from '@prisma/client';
import { connect } from 'http2';
import { AddItemDto } from 'src/items/dto/addItem.dto';
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

    async updateCategoryTotal(categoryId: string) {
      const total = await this.prisma.items.aggregate({
          where: { categoryId },
          _sum: { itemsTotal: true }
      });
  
      await this.prisma.categories.update({
          where: { id: categoryId },
          data: { total: total._sum.itemsTotal ?? 0 }
      });
  }
    
    async addItem(dto: AddItemDto, userId: string, categoryId: string) {
        const connectedUser = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })
        const existingItem = await this.prisma.items.findFirst({
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
        
        await this.updateCategoryTotal(categoryId)

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
              action: HistoryAction.ADDEDNEW,
              newValue: addedFields,
              oldValue: {}
          }
      });

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


    async deleteItem(itemId: string, userId: string) {
        const itemToDelete = await this.prisma.items.findUnique({
          where: {
            id: itemId
          }
        })
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

      await this.updateCategoryTotal(itemToDelete?.categoryId!)

        await this.prisma.history.create({
          data: {
              itemId: deletedItem.id,
              userId: connectedUser.id,
              action: HistoryAction.DELETED,
              newValue: {},
              oldValue: deletedFields,
              
          }
      });
        
        
        return deletedItem
    }

    async updateItem(itemId: string, updateData: Partial<Items>, userId: string) {
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

      
  
      //Définition des champs autorisés à être modifiés
      const allowedFields = ["name", "quantity", "unitPrice"]; // Liste des champs modifiables
      const filteredUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([key, value]) => 
              allowedFields.includes(key) && value !== undefined && value !== oldItem[key]
          )
      );
  
      //Si aucun champ n'est réellement modifié, ne pas faire de mise à jour
      if (Object.keys(filteredUpdateData).length === 0) {
          throw new BadRequestException("No changes detected");
      }
     
      
      // Mettre à jour uniquement les champs modifiés
      const updatedItem = await this.prisma.items.update({
          where: { id: itemId },
          data: filteredUpdateData
      });

      await this.updateItemTotal(itemId);
      await this.updateCategoryTotal(oldItem.categoryId!)
  
      // Récupérer les différences pour l'historique
      const modifiedFields = Object.fromEntries(
          Object.entries(filteredUpdateData).map(([key, newValue]) => [key, { old: oldItem[key], new: newValue }])
      );
  
      await this.prisma.history.create({
          data: {
              itemId,
              userId,
              action: HistoryAction.UPDATED,
              oldValue: Object.fromEntries(Object.entries(modifiedFields).map(([key, val]) => [key, val.old])),
              newValue: Object.fromEntries(Object.entries(modifiedFields).map(([key, val]) => [key, val.new])),
          }
      });
  
      
      
  
      return updatedItem;
  }

    async getAllItems (userId: string){
       const connectedUser = await this.prisma.users.findUnique({
        where:{id:userId}   
       })
       const allItems = await this.prisma.items.findMany({
        where:{
            createdBy:{
                companyId: connectedUser?.companyId
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
               companyId: connectedUser?.companyId
           }
       }
      })
      return item
   }

              async removeFromStock(itemId: string, quantityToRemove: number, userId: string) {
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
                  await this.updateCategoryTotal(updatedItem.categoryId!)
                  

              
                  await this.prisma.history.create({
                    data: {
                      action: HistoryAction.REMOVEDFROMSTOCK,
                      itemId,
                      quantity: quantityToRemove,
                      userId: connectedUser.id,
                      oldValue: { quantity: item.quantity },
                      newValue: { quantity: updatedItem.quantity },
                    },
                  });
                
                  return updatedItem;
                }

                async addToStock(itemId: string, quantityToAdd: number, userId: string) {
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
                  
                   
                  
                    
                    const updatedItem = await this.prisma.items.update({
                      where: { id: itemId },
                      data: {
                        quantity: item.quantity! + quantityToAdd,
                        itemsTotal: (item.quantity! + quantityToAdd) * (item.unitPrice!),
                      },
                    });
                    await this.updateItemTotal(itemId);
                    await this.updateCategoryTotal(updatedItem.categoryId!)
                    
  
                
                    await this.prisma.history.create({
                      data: {
                        action: HistoryAction.ADDEDTOSTOCK,
                        itemId,
                        quantity: quantityToAdd,
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
        const historyRecords = await this.prisma.history.findMany({
          where:{
            user:{
              companyId: connectedUser?.companyId
            }
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
        const parsedHistory = historyRecords.map(record => ({
          ...record,
          oldValue: typeof record.oldValue === "string" ? JSON.parse(record.oldValue) : record.oldValue,
          newValue: typeof record.newValue === "string" ? JSON.parse(record.newValue) : record.newValue,
      }));

      return parsedHistory
      }

      async getLowStockItems(userId: string) {
        const connectedUser = await this.prisma.users.findUnique({
          where:{id: userId}
        })
        const allItems = await this.prisma.items.findMany({
          where:{
            createdBy:{
              companyId: connectedUser?.companyId
            }
          }
        });
        const lowStockItems = allItems.filter(item => item.quantity! < 10);
        return lowStockItems;
      }

      async getTotalItemsAmount(): Promise<number> {
        const total = await this.prisma.items.aggregate({
            _sum: {
                itemsTotal: true
            }
        });
    
        return total._sum.itemsTotal || 0; // Retourne 0 si aucun itemsTotal n'est trouvé
    }
    
}
