import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ItemTypes } from '../../../domain/value-objects/item-type.vo';

export class RegisterItemDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEnum(ItemTypes) type: keyof typeof ItemTypes;
  @IsString() @IsNotEmpty() unit: string;
  @IsInt() @Min(0) unitPriceCents: number;
  @IsOptional() @IsInt() @Min(0) minimumStock?: number;
}
