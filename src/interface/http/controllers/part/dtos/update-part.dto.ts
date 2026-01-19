import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePartDto {
  @ApiPropertyOptional({ example: 'Filtro de óleo premium' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'FR-1234' })
  @IsOptional()
  @IsNotEmpty()
  sku?: string;

  @ApiPropertyOptional({ example: 59.9 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
