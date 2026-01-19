import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from '@domain/service-order/service-order.repository';
import { ServiceOrder } from '@domain/service-order/service-order.entity';

import { VehicleNotFound } from '@domain/vehicle/vehicle-not-found.error';
import { CustomerNotFound } from '@domain/customer/errors/customer-not-found.error';
import { FindCustomerUseCase } from '@application/customer';
import { FindVehicleUseCase } from '@application/vehicle/find/find-vehicle.usecase';

@Injectable()
export class FindByCustomerAndVehicleServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly repo: ServiceOrderRepository,
    private readonly findCustomer: FindCustomerUseCase,
    private readonly findVehicle: FindVehicleUseCase,
  ) {}

  async execute(input: {
    registrationNumber: string;
    plate: string;
  }): Promise<ServiceOrder> {
    const customer = await this.findCustomer.execute({
      registrationNumber: input.registrationNumber,
    });

    if (!customer) {
      throw new CustomerNotFound();
    }

    const vehicle = await this.findVehicle.execute({ plate: input.plate });

    if (!vehicle) {
      throw new VehicleNotFound();
    }

    const orm = this.repo.findByCustomerAndVehicle(customer.id, vehicle.id);

    return orm;
  }
}
