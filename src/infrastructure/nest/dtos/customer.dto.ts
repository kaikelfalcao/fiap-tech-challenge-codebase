import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Customer } from '../../../domain/entities/customer.entity';

export class CreateCustomerRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  document: string;
}

export class UpdateCustomerRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  document: string;
}

export class CustomerResponse {
  id?: string;
  name: string;
  email: string;
  document: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(customer: Customer) {
    Object.assign(this, customer.toJSON());
  }
}
