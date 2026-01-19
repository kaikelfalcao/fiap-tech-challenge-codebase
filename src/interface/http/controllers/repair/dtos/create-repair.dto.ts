import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRepairDto {
  @ApiProperty({ example: 'Troca de embreagem' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1200.5 })
  @IsNumber()
  cost: number;
}
