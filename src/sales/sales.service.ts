import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/createSale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HistoryAction } from '@prisma/client';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService,) { }


    async createSale(createSaleDto: CreateSaleDto, sellerId: string) {
        const { custumerName, custumerAddress, items, discount } = createSaleDto;

        const connectedUser = await this.prisma.users.findUnique({
            where: {
                id: sellerId,
            },
        });

        const productIds = items.map((item) => item.itemId);

        if (!items || !items.length) {
            throw new HttpException('No item found', 400);
        };

        const products = await this.prisma.items.findMany({
            where: {
                id: {
                    in: productIds
                }
            }
        });
        if (products.length !== items.length) {
            throw new HttpException('Some items cannot be found', 400)
        };

        const updatedProducts: { id: string; newQuantity: number }[] = [];
        let totalAmount = 0;
        let totalAmountWithDiscount = 0;

        for (const { itemId, quantity } of items) {
            const product = products.find((p) => p.id === itemId);

            if (!product) {
                throw new NotFoundException(`Le produit ${itemId} n'existe pas.`);
            }

            if ((product.quantity ?? 0) < quantity) {
                throw new BadRequestException(`Stock insuffisant pour ${product.name}`);
            }
            totalAmount += (product.unitPrice ?? 0) * quantity;
            totalAmountWithDiscount = totalAmount- (discount ?? 0   )

            updatedProducts.push({
                id: itemId,
                newQuantity: (product.quantity ?? 0) - quantity,
            });
        }

        const newSale = await this.prisma.sales.create({
            data: {
                sellerId,
                custumerName,
                custumerAddress,
                discount: discount ?? 0,
                items: {
                    create: items.map((item) => ({
                        item: { connect: { id: item.itemId } }, // Connecter l'item existant
                        quantity: item.quantity, // Ajouter la quantité vendue
                    }))
                },
                totalAmount: totalAmountWithDiscount
            }
        });
        
        const newInvoice = await this.prisma.invoices.create({
            data:{
                saleId: newSale.id,
                sellerId,
                discount: discount ?? 0,
                taxAmount: parseInt(process.env.TAX!, 10),
                totalAmount: newSale.totalAmount,
                finalAmount: (newSale.totalAmount*parseInt(process.env.TAX!, 10)/100),
            },
        })

        for (const { itemId, quantity } of items) {
            const product = products.find((p) => p.id === itemId);
            if (product) {
                await this.prisma.items.update({
                    where: { id: itemId },
                    data: { 
                        quantity: (product.quantity ?? 0) - quantity,
                        itemsTotal: ((product.quantity ?? 0) - quantity) * (product.unitPrice ?? 0)
                    },
                });
            }
        }

        await this.prisma.history.create({
            data:{
                action: HistoryAction.SOLD,
                newValue: newSale,
                oldValue: {},
                userId: sellerId
            }
        })

        return {
            sale: newSale,
            invoice:newInvoice
        };

    }

async getSales (userId: string){
    const connectedUser = await this.prisma.users.findUnique({
        where:{
            id:userId
        }
    })
    return await this.prisma.sales.findMany({
        where:{
            seller:{
                companyId: connectedUser?.companyId
            }
        },
        include:{
           items:true 
        }
    })
}

async getSaleById (userId: string, saleId: string){
    const connectedUser = await this.prisma.users.findUnique({
        where:{
            id:userId
        }
    })
    return await this.prisma.sales.findUnique({
        where:{
            seller:{
                companyId: connectedUser?.companyId
            },
            id: saleId
        }
    })
}

async getInvoices (userId: string){
    const connectedUser = await this.prisma.users.findUnique({
        where:{
            id:userId
        }
    })
    return await this.prisma.invoices.findMany({
        where:{
            seller:{
                companyId: connectedUser?.companyId
            }
        },
        include:{
            sale:true,
            seller: true
        }
    })
}
}
