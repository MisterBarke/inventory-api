import { Body, Controller, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto, UpdateDeliveryDto, UpdateDeliveryStatusDto } from './dto/create-delivey.dto';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('delivery')
export class DeliveryController {
    constructor (private deliveriesService: DeliveryService){}

    @Roles('SELLER')
    @Post(":id")
    async createDelivery(@Param('id') id: string, @Body() createDeliveryDto: CreateDeliveryDto){
        return this.deliveriesService.createDelivery(id, createDeliveryDto)
    }


    @Get("")
    async getDeliveries(@Req() request){
        return this.deliveriesService.getDeliveries(request.user.id)
    }

    @Roles("SELLER")
    @Patch(":id/status")
    async updateStatus(
        @Param("id") deliveryId: string,
        @Body() updateStatusDto: UpdateDeliveryStatusDto
    ) {
        return this.deliveriesService.updateDeliveryStatus(deliveryId, updateStatusDto);
    }

    @Roles("SELLER")
    @Patch(":id/info")
    async updateInfo(
        @Param("id") deliveryId: string,
        @Body() updateInfoDto: UpdateDeliveryDto
    ) {
        return this.deliveriesService.updateDeliveryInfo(deliveryId, updateInfoDto);
    }
}
