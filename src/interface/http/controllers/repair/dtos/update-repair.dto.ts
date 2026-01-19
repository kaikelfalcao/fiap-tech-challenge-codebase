import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateRepairDto {
  @ApiPropertyOptional({ example: 'Troca completa de embreagem' })
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 1350 })
  @IsOptional()
  @IsNumber()
  cost?: number;
}
