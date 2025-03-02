import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddItemDto } from 'src/auth/dto/addItem.dto';
import { ItemsService } from './items.service';

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
        @Param('itemId') itemId: string
    ) {
      return this.itemsService.deleteItem(itemId, categoryId);
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
    @Post(':itemId/category/:categoryId')
    updateItem(
        @Param('categoryId') categoryId: string,
        @Param('itemId') itemId: string,
        @Body() dto: AddItemDto) {
      return this.itemsService.updateItem(itemId, categoryId, dto);
    }
}
