import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

class ItemQuantityDto {
    @IsString()
    @IsNotEmpty()
    itemId: string;
  
    @IsNumber()
    @Min(1) // La quantité doit être au moins 1
    quantity: number;
  }

  export class CreateSaleDto {
    @IsString()
    @IsNotEmpty()
    custumerName: string;

    @IsString()
    @IsNotEmpty()
    custumerAddress: string;

    @IsNumber()
    discount: number;
    
    @IsNotEmpty()
    items: ItemQuantityDto[];
  }