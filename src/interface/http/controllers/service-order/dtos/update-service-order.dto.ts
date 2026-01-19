import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateServiceOrderPartDto {
  @ApiPropertyOptional({ example: 'uuid-da-peca' })
  @IsString()
  partId: string;

  @ApiPropertyOptional({ example: 3 })
  quantity: number;
}

class UpdateServiceOrderRepairDto {
  @ApiPropertyOptional({ example: 'uuid-do-reparo' })
  @IsString()
  repairId: string;
}

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({ type: [UpdateServiceOrderPartDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceOrderPartDto)
  parts?: UpdateServiceOrderPartDto[];

  @ApiPropertyOptional({ type: [UpdateServiceOrderRepairDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceOrderRepairDto)
  repairs?: UpdateServiceOrderRepairDto[];
}
