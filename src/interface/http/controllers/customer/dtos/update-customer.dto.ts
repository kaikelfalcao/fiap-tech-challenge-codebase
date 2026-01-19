import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Cliente X' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'contato@empresa.com' })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'CPF/CNPJ Válido' })
  @IsOptional()
  @IsNotEmpty()
  registrationNumber?: string;
}
