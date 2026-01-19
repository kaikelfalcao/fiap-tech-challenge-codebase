import { Repair } from '@domain/repair/repair.entity';
import { RepairResponseDto } from './dtos/repair-response.dto';

export class RepairPresenter {
  static toResponse(repair: Repair): RepairResponseDto {
    return {
      id: repair.id,
      description: repair.description,
      cost: repair.cost,
      createdAt: repair.createdAt?.toISOString(),
      updatedAt: repair.updatedAt?.toISOString(),
    };
  }
}
