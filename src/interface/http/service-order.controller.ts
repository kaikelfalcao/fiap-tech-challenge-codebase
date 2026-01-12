import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { CreateServiceOrderUseCase } from 'src/application/usecases/service-order/create-service-order.usecase';
import type { CreateServiceOrderDto } from './dtos/create-service-order.dto';
import { ServiceOrderPresenter } from '../presenters/service-order.presenter';
import { UpdateServiceOrderDto } from './dtos/update-service-order.dto';
import { UpdateServiceOrderUseCase } from 'src/application/usecases/service-order/update-service-order.usecase';
import { UpdateServiceOrderStatusDto } from './dtos/update-service-order-status';
import { UpdateServiceOrderStatusUseCase } from 'src/application/usecases/service-order/update-service-order-status.usecase';
import { FindServiceOrderUseCase } from 'src/application/usecases/service-order/find-service-order.usecase';
import { FindAllServiceOrderUseCase } from 'src/application/usecases/service-order/find-all-service-order.usecase';
import { DeleteServiceOrderUseCase } from 'src/application/usecases/service-order/delete-service-order.usecase';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private createUseCase: CreateServiceOrderUseCase,
    private updateUseCase: UpdateServiceOrderUseCase,
    private readonly updateStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly findUseCase: FindServiceOrderUseCase,
    private readonly findAllUseCase: FindAllServiceOrderUseCase,
    private readonly deleteUseCase: DeleteServiceOrderUseCase,
  ) {}

  @Get()
  async findAll() {
    return (await this.findAllUseCase.execute()).map((order) =>
      ServiceOrderPresenter.toResponse(order),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const order = await this.findUseCase.execute({ id });
    if (!order) {
      throw new NotFoundException(`Ordem de serviço ${id} não encontrada`);
    }
    return ServiceOrderPresenter.toResponse(order);
  }

  @Post()
  async create(@Body() body: CreateServiceOrderDto) {
    const result = await this.createUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(result);
  }

  @Patch()
  async update(@Body() body: UpdateServiceOrderDto) {
    const { updatedOrder } = await this.updateUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Patch('status')
  async updateStatus(@Body() body: UpdateServiceOrderStatusDto) {
    const { updatedOrderId } = await this.updateStatusUseCase.execute(body);
    const updatedOrder = await this.findUseCase.execute({ id: updatedOrderId });
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id: id });
  }
}
