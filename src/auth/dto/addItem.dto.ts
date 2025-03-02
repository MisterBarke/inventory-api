import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class AddItemDto{
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber()
    @IsNotEmpty()
    quantity: number

    
    @IsNumber()
    @IsNotEmpty()
    unitPrice: number
}