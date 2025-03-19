import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddItemDto } from '../../items/dto/addItem.dto';
import { CreateSaleDto } from 'src/sales/dto/createSale.dto';
import { IsEnum } from "class-validator";
import { DeliveryStatus } from '@prisma/client';

export class UpdateDeliveryStatusDto {
    @IsEnum(DeliveryStatus, { message: "Le statut doit être PENDING, IN_PROGRESS ou DELIVERED" })
    status: DeliveryStatus;
}


export class CreateDeliveryDto {

  @IsString()
  @IsNotEmpty()
  deliveryMan: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}

export class UpdateDeliveryDto {

    @IsOptional()
    @IsString()
    deliveryMan ?: string;
  
    @IsOptional()
    @IsString()
    location ?: string;
  }