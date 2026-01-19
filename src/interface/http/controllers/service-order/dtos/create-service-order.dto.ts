import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateServiceOrderPartDto {
  @ApiProperty({ example: 'uuid-da-peca' })
  @IsString()
  @IsNotEmpty()
  partId: string;

  @ApiProperty({ example: 2 })
  quantity: number;
}

class CreateServiceOrderRepairDto {
  @ApiProperty({ example: 'uuid-do-reparo' })
  @IsString()
  @IsNotEmpty()
  repairId: string;
}

export class CreateServiceOrderDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  customerRegistrationNumber: string;

  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty()
  vehiclePlate: string;

  @ApiPropertyOptional({ type: [CreateServiceOrderPartDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderPartDto)
  parts?: CreateServiceOrderPartDto[];

  @ApiPropertyOptional({ type: [CreateServiceOrderRepairDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderRepairDto)
  repairs?: CreateServiceOrderRepairDto[];
}
