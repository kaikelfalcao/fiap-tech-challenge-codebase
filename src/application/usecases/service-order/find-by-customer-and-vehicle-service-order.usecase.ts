import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepository } from 'src/application/ports/service-order-repository';
import { ServiceOrder } from 'src/domain/entities/service-order.entity';
import { FindCustomerUseCase } from '../customer/find-customer.usecase';
import { FindVehicleUseCase } from '../vehicle/find-vehicle.usecase';
import { CustomerNotFound } from 'src/domain/errors/customer-not-found.error';
import { VehicleNotFound } from 'src/domain/errors/vehicle-not-found.error';

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
