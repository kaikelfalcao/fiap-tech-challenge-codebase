import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_ORDER_REPOSITORY,
  type IServiceOrderRepository,
} from '../../../domain/service-order.repository';
import { ServiceOrderId } from '../../../domain/value-objects/service-order-id.vo';
import { SERVICE_ORDER_STATUS_LABEL } from '../../../domain/value-objects/service-order-status.vo';
import { toServiceOrderOutput } from '../../helpers/service-order-output.mapper';
import type { GetServiceOrderOutput } from '../get/get-service-order.use-case';

import {
  CUSTOMER_PUBLIC_API,
  type ICustomerPublicApi,
} from '@/modules/customer/public/customer.public-api';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetServiceOrderByCustomerInput {
  taxId: string;
  orderId: string;
}

@Injectable()
export class GetServiceOrderByCustomerUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orders: IServiceOrderRepository,
    @Inject(CUSTOMER_PUBLIC_API)
    private readonly customerApi: ICustomerPublicApi,
  ) {}

  async execute(
    input: GetServiceOrderByCustomerInput,
  ): Promise<GetServiceOrderOutput> {
    const customer = await this.customerApi.getByTaxId(input.taxId);
    if (!customer) {
      throw new NotFoundException('Customer', input.taxId);
    }

    const order = await this.orders.findById(
      ServiceOrderId.fromString(input.orderId),
    );
    if (!order) {
      throw new NotFoundException('ServiceOrder', input.orderId);
    }

    if (order.customerId !== customer.id) {
      throw new BusinessRuleException(
        'This service order does not belong to the provided customer',
      );
    }

    return toServiceOrderOutput(order);
  }
}
