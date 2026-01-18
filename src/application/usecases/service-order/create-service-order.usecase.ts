import type { ServiceOrderRepository } from 'src/domain/repositories/service-order.repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { FindCustomerUseCase } from '../../customer/find/find-customer.usecase';
import { FindVehicleUseCase } from '../vehicle/find-vehicle.usecase';
import { ReservePartsUseCase } from '../part/reserve-part.usecase';
import { GetRepairsUseCase } from '../repair/get-repair.usecase';
import { Inject, Injectable } from '@nestjs/common';

export interface CreateServiceOrderInput {
  customerRegistrationNumber: string;
  vehiclePlate: string;
  parts?: Array<{ partId: string; quantity: number }>;
  repairs?: Array<{ repairId: string }>;
}

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly findCustomerUseCase: FindCustomerUseCase,
    private readonly findVehicleUseCase: FindVehicleUseCase,
    private readonly reservePartsUseCase: ReservePartsUseCase,
    private readonly getRepairsUseCase: GetRepairsUseCase,
    @Inject('ServiceOrderRepository')
    private readonly repository: ServiceOrderRepository,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    const customer = await this.findCustomerUseCase.execute({
      registrationNumber: input.customerRegistrationNumber,
    });
    if (!customer) throw new Error('Cliente não encontrado');

    const vehicle = await this.findVehicleUseCase.execute({
      plate: input.vehiclePlate,
    });
    if (!vehicle) throw new Error('Veículo não encontrado');

    if (vehicle.customerId !== customer.id) {
      throw new Error('Veículo não pertence ao cliente informado');
    }

    const order = ServiceOrder.create(customer.id, vehicle.id);

    if (input.parts?.length) {
      const { processed: processedParts } =
        await this.reservePartsUseCase.execute(input.parts);
      processedParts.forEach((p) =>
        order.assignPart(p.partId, p.quantity, p.priceAtTime),
      );
    }

    if (input.repairs?.length) {
      const { processed: processedRepairs } =
        await this.getRepairsUseCase.execute(input.repairs);
      processedRepairs.forEach((r) =>
        order.assignRepair(r.repairId, r.costAtTime),
      );
    }
    await this.repository.save(order);
    return order;
  }
}
