import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from 'src/auth/dto/createCategory.dto';


@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
constructor (private categoriesService: CategoriesService){}
@ApiCreatedResponse({ description: 'Create a new category' })
@ApiResponse({
  status: 201,
  description: 'Category Created',
})
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Server Error' })
@ApiBody({ type: CreateCategoryDto })
@ApiOperation({
  operationId: 'CreateCategory',
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
@Post('')
create(@Body() dto: CreateCategoryDto, @Req() request) {
  return this.categoriesService.createCategory(dto, request.user.id);
}

@ApiCreatedResponse({ description: 'Update a category' })
@ApiResponse({
  status: 200,
  description: 'Category updated',
})
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Server Error' })
@ApiBody({ type: CreateCategoryDto })
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
@Put(':id')
update(@Param('id') id: string, @Body() dto: CreateCategoryDto, @Req() request ) {
  return this.categoriesService.updateCategory(id, dto, request.user.id);
}

@ApiCreatedResponse({ description: 'Update a category' })
@ApiResponse({
  status: 200,
  description: 'Category updated',
})
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Server Error' })
@ApiBody({ type: CreateCategoryDto })
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
@Delete(':id')
deleteCategory(@Param('id') id: string, @Req() request) {
  return this.categoriesService.deleteCategory(id, request.user.id);
}

@ApiCreatedResponse({ description: 'Update a category' })
@ApiResponse({
  status: 200,
  description: 'Category updated',
})
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Server Error' })
@ApiBody({ type: CreateCategoryDto })
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
getAllCategories(@Req() request) {
  return this.categoriesService.getCategories(request.user.id);
}

@ApiCreatedResponse({ description: 'Update a category' })
@ApiResponse({
  status: 200,
  description: 'Category updated',
})
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Server Error' })
@ApiBody({ type: CreateCategoryDto })
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
@Get(':id')
getOneCategory(@Req() request, @Param('id') id: string) {
  return this.categoriesService.getOneCategory(id, request.user.id);
}
}
