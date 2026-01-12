import { Controller, Post, Body } from '@nestjs/common';
import { CreateServiceOrderUseCase } from 'src/application/usecases/service-order/create-service-order.usecase';
import type { CreateServiceOrderDto } from './dtos/create-service-order.dto';
import { ServiceOrderPresenter } from '../presenters/service-order.presenter';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(private createUseCase: CreateServiceOrderUseCase) {}

  @Post()
  async create(@Body() body: CreateServiceOrderDto) {
    const result = await this.createUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(result);
  }
}
