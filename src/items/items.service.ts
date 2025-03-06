import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { connect } from 'http2';
import { AddItemDto } from 'src/auth/dto/addItem.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemsService {
    constructor(private prisma: PrismaService) { }

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

        })
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

    async deleteItem(itemId: string, categoryId: string) {
        const deletedItem = await this.prisma.items.delete({ where: { id: itemId } });
        
        await this.updateTotals(categoryId);
        return deletedItem
    }

    async updateItem(itemId: string, categoryId: string, dto: AddItemDto) {
        const updatedItem = await this.prisma.items.update({
             where: { id:itemId },
              data: {
                name: dto.name ?? dto.name, 
                quantity: dto.quantity ?? dto.quantity,
                unitPrice: dto.unitPrice ?? dto.unitPrice 
            } 
        })
        await this.updateItemTotal(itemId);
        await this.updateTotals(categoryId);
        return updatedItem
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

    async removeFromStock(itemId: string, quantityToRemove: number, userId: string, categoryId: string) {

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
            itemId,
            quantity: quantityToRemove,
            userId,
          },
        });
      
        return updatedItem;
      }
      
      async getHistory() {
        return this.prisma.history.findMany({
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
