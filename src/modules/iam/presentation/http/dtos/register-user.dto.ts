import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { Roles } from '../../../domain/value-objects/role.vo';

export class RegisterUserDto {
  @IsString() @IsNotEmpty() taxId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(Roles) role: keyof typeof Roles;
}
