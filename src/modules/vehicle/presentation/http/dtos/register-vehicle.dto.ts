import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class RegisterVehicleDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1886) // primeiro automóvel da história
  @Max(new Date().getFullYear() + 1)
  year: number;
}
