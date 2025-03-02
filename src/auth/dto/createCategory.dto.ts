import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddItemDto } from './addItem.dto';

export class CreateCategoryDto {
  items: AddItemDto[]


  @IsString()
  @IsNotEmpty()
  title: string;
}