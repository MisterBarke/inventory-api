import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CreateSaleDto } from './dto/createSale.dto';
import { SalesService } from './sales.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('sales')
export class SalesController {
    constructor(private salesService: SalesService){}

@Roles("SELLER")
@Post('')
create(@Body() dto: CreateSaleDto, @Req() request) {
  return this.salesService.createSale(dto, request.user.id);
}

@Get('')
getAllSales(@Req() request) {
  return this.salesService.getSales(request.user.id);
}

@Get(':id/get-one')
getOneSale(@Req() request, @Param('id') saleId) {
  return this.salesService.getSaleById(request.user.id, saleId);
}
}
