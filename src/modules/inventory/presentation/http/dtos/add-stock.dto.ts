import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddStockDto {
  @IsInt() @Min(1) amount: number;
  @IsEnum(['PURCHASE', 'ADJUSTMENT']) reason: 'PURCHASE' | 'ADJUSTMENT';
  @IsOptional() @IsString() note?: string;
}
