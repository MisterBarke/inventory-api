import { BadRequestException, Injectable } from '@nestjs/common';
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
        await this.updateTotals(categoryId);
        return updatedItem
    }
}
