import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';
import { ServiceOrderService } from '../../../domain/value-objects/service-order-service.vo';

import {
  CATALOG_PUBLIC_API,
  type ICatalogPublicApi,
} from '@/modules/catalog/public/catalog.public-api';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface AddServiceToOrderInput {
  orderId: string;
  serviceId: string;
  quantity: number;
}

@Injectable()
export class AddServiceToOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(CATALOG_PUBLIC_API)
    private readonly catalogApi: ICatalogPublicApi,
  ) {}

  async execute(input: AddServiceToOrderInput): Promise<void> {
    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }

    const service = await this.catalogApi.getServiceById(input.serviceId);
    if (!service) {
      throw new NotFoundException('Service', input.serviceId);
    }
    if (!service.active) {
      throw new ValidationException(`Service ${service.code} is inactive`);
    }

    try {
      order.addService(
        ServiceOrderService.create({
          serviceId: service.id,
          name: service.name,
          unitPriceCents: service.basePriceCents,
          quantity: input.quantity,
        }),
      );
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    await this.orders.update(order);
  }
}
