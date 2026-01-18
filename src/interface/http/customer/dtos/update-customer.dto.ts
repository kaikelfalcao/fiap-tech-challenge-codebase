import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateCustomerDto {
  @IsNotEmpty()
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsNotEmpty()
  registrationNumber?: string;
}
