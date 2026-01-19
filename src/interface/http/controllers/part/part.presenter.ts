import { Part } from '@domain/part/part.entity';
import { PartResponseDto } from './dtos/part-response.dto';

export class PartPresenter {
  static toResponse(part: Part): PartResponseDto {
    return {
      id: part.id,
      name: part.name,
      sku: part.sku,
      price: part.price,
      quantity: part.quantity,
      createdAt: part.createdAt?.toISOString(),
      updatedAt: part.updatedAt?.toISOString(),
    };
  }
}
