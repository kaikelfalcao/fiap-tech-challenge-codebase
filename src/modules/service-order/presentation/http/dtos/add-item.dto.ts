import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
