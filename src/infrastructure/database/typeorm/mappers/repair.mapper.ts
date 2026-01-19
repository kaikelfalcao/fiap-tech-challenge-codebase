import { Repair } from '@domain/repair/repair.entity';
import { RepairOrm } from '../entities/repair.orm';

export class RepairMapper {
  static toOrm(entity: Repair): RepairOrm {
    const orm = new RepairOrm();
    orm.id = entity.id;
    orm.description = entity.description;
    orm.cost = entity.cost;
    return orm;
  }

  static toEntity(orm: RepairOrm): Repair {
    return new Repair(
      orm.id,
      orm.description,
      orm.cost,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
