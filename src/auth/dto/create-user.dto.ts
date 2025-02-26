import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({
      type: 'string',
      name: 'email',
      description: 'la propriété email de type string',
      default: 'companysoftart@gmail.com',
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: 'string',
        name: 'password',
        description: 'la propriété password de type string',
        default: 'companysoftart@gmail.com',
      })
      @IsString()
      @IsNotEmpty()
      password: string;
}

export class LoginDto {
  @ApiProperty({
    type: 'string',
    name: 'email',
    description: 'la propriété email de type string',
    default: '',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
      type: 'string',
      name: 'password',
      description: 'la propriété password de type string ',
      default: '',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}