import { IsInt, IsString, Min } from 'class-validator';

export class AdjustStockDto {
  @IsInt() @Min(0) newQuantity: number;
  @IsString() note: string;
}
