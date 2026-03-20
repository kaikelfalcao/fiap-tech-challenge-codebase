import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty() taxId: string;
  @IsString() @IsNotEmpty() password: string;
}
