import { Inject, Injectable } from '@nestjs/common';

import { ServiceOrder } from '../../../domain/service-order.entity';
import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';

import {
  CUSTOMER_PUBLIC_API,
  type ICustomerPublicApi,
} from '@/modules/customer/public/customer.public-api';
import {
  VEHICLE_PUBLIC_API,
  type IVehiclePublicApi,
} from '@/modules/vehicle/public/vehicle.public-api';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface OpenServiceOrderInput {
  customerTaxId: string;
  vehicleLicensePlate: string;
}

export interface OpenServiceOrderOutput {
  id: string;
}

@Injectable()
export class OpenServiceOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(CUSTOMER_PUBLIC_API)
    private readonly customerApi: ICustomerPublicApi,
    @Inject(VEHICLE_PUBLIC_API)
    private readonly vehicleApi: IVehiclePublicApi,
  ) {}

  async execute(input: OpenServiceOrderInput): Promise<OpenServiceOrderOutput> {
    const customer = await this.customerApi.getByTaxId(input.customerTaxId);
    if (!customer) {
      throw new NotFoundException('Customer', input.customerTaxId);
    }
    if (!customer.active) {
      throw new ValidationException(
        'Cannot open order for an inactive customer',
      );
    }

    const vehicle = await this.vehicleApi.findByLicensePlate(
      input.vehicleLicensePlate,
    );
    if (!vehicle) {
      throw new NotFoundException('Vehicle', input.vehicleLicensePlate);
    }
    if (vehicle.customerId !== customer.id) {
      throw new ValidationException('Vehicle does not belong to this customer');
    }

    const order = ServiceOrder.create({
      id: ServiceOrderId.generate(),
      customerId: customer.id,
      vehicleId: vehicle.id,
    });

    await this.orders.save(order);
    return { id: order.id().value };
  }
}
