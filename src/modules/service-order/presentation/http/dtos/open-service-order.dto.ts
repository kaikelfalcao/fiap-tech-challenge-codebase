import { IsNotEmpty, IsString } from 'class-validator';

export class OpenServiceOrderDto {
  @IsString()
  @IsNotEmpty()
  customerTaxId: string;

  @IsString()
  @IsNotEmpty()
  vehicleLicensePlate: string;
}
