import { Part } from 'src/domain/entities/part.entity';
import { PartOrm } from '../entities/part.orm';

export class PartMapper {
  public static toOrm(entity: Part): PartOrm {
    const orm = new PartOrm();
    orm.id = entity.id;
    orm.name = entity.name;
    orm.sku = entity.sku;
    orm.price = entity.price;
    orm.quantity = entity.quantity;
    return orm;
  }

  public static toEntity(orm: PartOrm): Part {
    return new Part(
      orm.id,
      orm.name,
      orm.sku,
      orm.price,
      orm.quantity,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
