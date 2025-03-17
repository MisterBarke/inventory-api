import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddItemDto } from '../../items/dto/addItem.dto';

export class CreateCategoryDto {
  items: AddItemDto[]


  @IsString()
  @IsNotEmpty()
  title: string;
}