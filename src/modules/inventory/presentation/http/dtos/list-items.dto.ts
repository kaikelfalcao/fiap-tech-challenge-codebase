import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { ItemTypes } from '../../../domain/value-objects/item-type.vo';

export class ListItemsDto {
  @IsOptional() @IsEnum(ItemTypes) type?: keyof typeof ItemTypes;
  @IsOptional() @IsBoolean() @Type(() => Boolean) active?: boolean;
  @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsInt() @Min(1) @Max(100) @Type(() => Number) limit?: number;
}
