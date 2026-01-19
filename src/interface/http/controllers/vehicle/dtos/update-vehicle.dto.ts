import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Honda' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Civic' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 'XYZ-9876' })
  @IsOptional()
  @IsString()
  plate?: string;
}
