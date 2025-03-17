import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CreateSaleDto } from './dto/createSale.dto';
import { SalesService } from './sales.service';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/role.decorator';

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

@Get('invoices')
getAllInvoices(@Req() request) {
  return this.salesService.getInvoices(request.user.id);
}

@Get(':id/get-one')
getOneSale(@Req() request, @Param('id') saleId) {
  return this.salesService.getSaleById(request.user.id, saleId);
}

@Get('/total-sales')
async getTotalSalesByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
) {
    if (!startDate || !endDate) {
        throw new BadRequestException('startDate et endDate sont requis');
    }
// GET /total-sales?startDate=2025-03-01&endDate=2025-03-31
    return { 
        totalSales: await this.salesService.getTotalSalesByPeriod(new Date(startDate), new Date(endDate)) 
    };
}
}
