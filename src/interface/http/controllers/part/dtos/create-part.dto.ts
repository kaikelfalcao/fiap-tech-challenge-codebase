import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ example: 'Filtro de óleo' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'FR-1234' })
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 49.9 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
