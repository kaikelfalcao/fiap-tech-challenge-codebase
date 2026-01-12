import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import {
  ReservePartsUseCase,
  ReservePartInput,
} from '../part/reserve-part.usecase';
import { ReturnPartsUseCase } from '../part/return-part.usecase';
import { FindPartUseCase } from '../part/find-part.usecase';
import { FindRepairUseCase } from '../repair/find-repair.usecase';

export interface UpdateServiceOrderInput {
  serviceOrderId: string;
  parts?: Array<{ partId: string; quantity: number }>;
  repairs?: Array<{ repairId: string }>;
}

export interface UpdateServiceOrderOutput {
  updatedOrder: ServiceOrder;
  removedParts: Array<{ partId: string; quantity: number }>;
}

@Injectable()
export class UpdateServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repository: ServiceOrderRepository,
    private readonly reservePartsUseCase: ReservePartsUseCase,
    private readonly returnPartsUseCase: ReturnPartsUseCase,
    private readonly findPartUseCase: FindPartUseCase,
    private readonly findRepairUseCase: FindRepairUseCase,
  ) {}

  async execute(
    input: UpdateServiceOrderInput,
  ): Promise<UpdateServiceOrderOutput> {
    const order = await this.repository.findById(input.serviceOrderId);
    if (!order) throw new Error('Ordem de serviço não encontrada');

    const removedParts: Array<{ partId: string; quantity: number }> = [];
    const partsToReserve: ReservePartInput[] = [];

    if (input.parts) {
      const newPartsMap = new Map(
        input.parts.map((p) => [p.partId, p.quantity]),
      );

      order.parts = order.parts.filter((existingPart) => {
        const updatedQuantity = newPartsMap.get(existingPart.partId);

        if (updatedQuantity === undefined) {
          removedParts.push({
            partId: existingPart.partId,
            quantity: existingPart.quantity,
          });
          return false;
        }

        if (updatedQuantity < existingPart.quantity) {
          removedParts.push({
            partId: existingPart.partId,
            quantity: existingPart.quantity - updatedQuantity,
          });
          existingPart.quantity = updatedQuantity;
        } else if (updatedQuantity > existingPart.quantity) {
          partsToReserve.push({
            partId: existingPart.partId,
            quantity: updatedQuantity - existingPart.quantity,
          });
          existingPart.quantity = updatedQuantity;
        }

        newPartsMap.delete(existingPart.partId);
        return true;
      });

      for (const [partId, quantity] of newPartsMap) {
        const part = await this.findPartUseCase.execute({ id: partId });
        if (!part) throw new Error(`Peça ${partId} não encontrada`);
        partsToReserve.push({ partId, quantity });
        order.assignPart(part.id, quantity, part.price);
      }
    }

    if (removedParts.length) {
      await this.returnPartsUseCase.execute(
        removedParts.map((p) => ({ partId: p.partId, quantity: p.quantity })),
      );
    }

    if (partsToReserve.length) {
      await this.reservePartsUseCase.execute(partsToReserve);
    }

    if (input.repairs) {
      order.repairs = [];
      for (const { repairId } of input.repairs) {
        const repair = await this.findRepairUseCase.execute({ id: repairId });
        if (!repair) throw new Error(`Reparo ${repairId} não encontrado`);
        order.assignRepair(repair.id, repair.cost);
      }
    }

    await this.repository.save(order);

    return { updatedOrder: order, removedParts };
  }
}
