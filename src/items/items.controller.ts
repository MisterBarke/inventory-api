import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddItemDto } from './dto/addItem.dto';
import { ItemsService } from './items.service';
import { Items } from '@prisma/client';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('items')
export class ItemsController {
    constructor (private itemsService: ItemsService){}
    @ApiCreatedResponse({ description: 'Update a category' })
    @ApiResponse({
      status: 200,
      description: 'Category updated',
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: 'Server Error' })
    @ApiBody({ type: AddItemDto })
    @ApiOperation({
      operationId: 'updateCategory',
      requestBody: {
        content: {
          'multipart/form-data': {
            encoding: {
              about: {
                contentType: 'application/json',
              },
            },
            schema: {
              type: 'object',
              properties: {
                about: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      },
    })
    @Roles('ADMIN')
    @Post(':id')
    addItem(@Body() dto: AddItemDto, @Req() request, @Param('id') id: string) {
      return this.itemsService.addItem(dto, request.user.id, id);
    }

    @ApiCreatedResponse({ description: 'Update a category' })
    @ApiResponse({
      status: 200,
      description: 'Category updated',
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: 'Server Error' })
    @ApiBody({ type: AddItemDto })
    @ApiOperation({
      operationId: 'updateCategory',
      requestBody: {
        content: {
          'multipart/form-data': {
            encoding: {
              about: {
                contentType: 'application/json',
              },
            },
            schema: {
              type: 'object',
              properties: {
                about: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      },
    })
    @Roles('ADMIN')
    @Delete(':itemId')
    deleteItem(
        @Param('itemId') itemId: string,
        @Req() request
    ) {
      return this.itemsService.deleteItem(itemId, request.user.id);
    }

    @ApiCreatedResponse({ description: 'Update a category' })
    @ApiResponse({
      status: 200,
      description: 'Category updated',
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: 'Server Error' })
    @ApiBody({ type: AddItemDto })
    @ApiOperation({
      operationId: 'updateCategory',
      requestBody: {
        content: {
          'multipart/form-data': {
            encoding: {
              about: {
                contentType: 'application/json',
              },
            },
            schema: {
              type: 'object',
              properties: {
                about: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      },
    })
    @Roles('ADMIN')
    @Put(':itemId')
    updateItem(
        @Param('itemId') itemId: string,
        @Req() request,
        @Body() updateData: Partial<Items>,) {
      return this.itemsService.updateItem(itemId, updateData, request.user.id);
    }

    @ApiCreatedResponse({ description: 'Update a category' })
    @ApiResponse({
      status: 200,
      description: 'Category updated',
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: 'Server Error' })
    @ApiBody({ type: AddItemDto })
    @ApiOperation({
      operationId: 'updateCategory',
      requestBody: {
        content: {
          'multipart/form-data': {
            encoding: {
              about: {
                contentType: 'application/json',
              },
            },
            schema: {
              type: 'object',
              properties: {
                about: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      },
    })
    @Get('')
    getAllItems(
        @Req() request) {
      return this.itemsService.getAllItems(request.user.id);
    }

    @Roles('ADMIN')
    @Patch(':itemId/remove-stock')
async removeStock(
  @Param('itemId') itemId: string,
  @Body('quantity') quantityToRemove: number,
  @Req() req
) {
  const userId = req.user.id; 
  return this.itemsService.removeFromStock(itemId, quantityToRemove, userId);
}
@Roles('ADMIN')
@Patch(':itemId/add-stock')
async addToStock(
  @Param('itemId') itemId: string,
  @Body('quantity') quantityToAdd: number,
  @Req() req
) {
  const userId = req.user.id; 
  return this.itemsService.addToStock(itemId, quantityToAdd, userId);
}

@Get('history')
async getHistory(@Req() request) {
  return this.itemsService.getHistory(request.user.id);
}

@Get(':id/getone')
async getOneItem(@Req() request, @Param('id') itemId) {
  return this.itemsService.getOneItem(request.user.id, itemId);
}

@Get('low-stock')
async getLowStockItems(@Req() request){
  return this.itemsService.getLowStockItems(request.user.id)
}

@Get('total-amount')
async getTotalItemsAmount(){
  return this.itemsService.getTotalItemsAmount()
}
}
