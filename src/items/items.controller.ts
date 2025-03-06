import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddItemDto } from 'src/auth/dto/addItem.dto';
import { ItemsService } from './items.service';
import { Items } from '@prisma/client';

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
    @Delete(':itemId/category/:categoryId')
    deleteItem(
        @Param('categoryId') categoryId: string,
        @Param('itemId') itemId: string,
        @Req() request
    ) {
      return this.itemsService.deleteItem(itemId, categoryId, request.user.id);
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
    @Put(':itemId/category/:categoryId')
    updateItem(
        @Param('categoryId') categoryId: string,
        @Param('itemId') itemId: string,
        @Req() request,
        @Body() updateData: Partial<Items>,) {
      return this.itemsService.updateItem(itemId, categoryId, updateData, request.user.id);
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

    @Patch(':itemId/remove-stock/:categoryId')
async removeStock(
  @Param('itemId') itemId: string,
  @Param('categoryId') categoryId: string,
  @Body('quantity') quantityToRemove: number,
  @Req() req
) {
  const userId = req.user.id; 
  return this.itemsService.removeFromStock(itemId, quantityToRemove, userId, categoryId);
}

@Get('history')
async getHistory() {
  return this.itemsService.getHistory();
}
}
