import { Part } from 'src/domain/entities/part.entity';

export class PartPresenter {
  static toResponse(part: Part) {
    return {
      id: part.id,
      name: part.name,
      sku: part.sku,
      price: part.price,
      quantity: part.quantity,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    };
  }
}
