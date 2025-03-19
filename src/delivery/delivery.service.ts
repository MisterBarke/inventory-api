import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeliveryDto, UpdateDeliveryDto, UpdateDeliveryStatusDto } from './dto/create-delivey.dto';
import { Deliveries } from '@prisma/client';

@Injectable()
export class DeliveryService {
    constructor(private prisma: PrismaService) { }

    async createDelivery(saleId: string, dto: CreateDeliveryDto) {

        const existingDeliveries = await this.prisma.deliveries.findFirst({
            where: {
                saleId
            }
        })

        if (existingDeliveries) {
            throw new HttpException('Sorry, this delivery already exist', 409)
        }
        const delivery = await this.prisma.deliveries.create({
            data: {
                saleId,
                deliveryMan: dto.deliveryMan,
                location: dto.location
            }
        })

        return delivery
    }

    async getDeliveries(userId: string) {
        const connectedfUser = await this.prisma.users.findUnique({
            where: {
                id: userId
            }
        })

        const getDeliveries = await this.prisma.deliveries.findMany({
            where: {
                sale: {
                    seller: {
                        companyId: connectedfUser?.companyId
                    }
                }
            },
            include: {
                sale: {
                    include: {
                        invoice: true
                    }
                }
            }
        })

        return getDeliveries
    }

    async updateDeliveryStatus(deliveryId: string, updateStatusDto: UpdateDeliveryStatusDto) {
        const delivery = await this.prisma.deliveries.findUnique({ where: { id: deliveryId } });

        if (!delivery) {
            throw new NotFoundException("Livraison non trouvée");
        }

        return this.prisma.deliveries.update({
            where: { id: deliveryId },
            data: { status: updateStatusDto.status },
        });
    }

    async updateDeliveryInfo(deliveryId: string, updateInfoDto: UpdateDeliveryDto) {
        const delivery = await this.prisma.deliveries.findUnique({ where: { id: deliveryId } });

        if (!delivery) {
            throw new NotFoundException("Livraison non trouvée");
        }

        return this.prisma.deliveries.update({
            where: { id: deliveryId },
            data: {
                deliveryMan: updateInfoDto.deliveryMan,
                location: updateInfoDto.location,
            },
        });
    }
}
