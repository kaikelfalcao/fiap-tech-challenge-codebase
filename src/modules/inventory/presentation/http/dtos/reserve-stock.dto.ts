import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ReserveStockDto {
  @IsInt() @Min(1) amount: number;
  @IsUUID() referenceId: string;
  @IsOptional() @IsString() note?: string;
}
