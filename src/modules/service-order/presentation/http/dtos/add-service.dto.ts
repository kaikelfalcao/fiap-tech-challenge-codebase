import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddServiceDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
