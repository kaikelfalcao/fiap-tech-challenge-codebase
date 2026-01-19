import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Cliente X' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456789', description: 'CPF/CNPJ Válido' })
  @IsNotEmpty()
  registrationNumber: string;
}
