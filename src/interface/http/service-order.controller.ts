import { ApproveServiceOrderByEmailUseCase } from 'src/application/usecases/service-order/approve-service-order-by-email.usecase';
import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Param,
  NotFoundException,
  Delete,
  Query,
  UseGuards,
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
import { FindByCustomerAndVehicleServiceOrderUseCase } from 'src/application/usecases/service-order/find-by-customer-and-vehicle-service-order.usecase';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private createUseCase: CreateServiceOrderUseCase,
    private updateUseCase: UpdateServiceOrderUseCase,
    private readonly updateStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly findUseCase: FindServiceOrderUseCase,
    private readonly findAllUseCase: FindAllServiceOrderUseCase,
    private readonly deleteUseCase: DeleteServiceOrderUseCase,
    private readonly findByCustomerAndVehicleUseCase: FindByCustomerAndVehicleServiceOrderUseCase,
    private readonly approveByEmailUseCase: ApproveServiceOrderByEmailUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return (await this.findAllUseCase.execute()).map((order) =>
      ServiceOrderPresenter.toResponse(order),
    );
  }

  @Get('/lookup')
  async findByCustomerAndVehicle(
    @Query('customerRegistrationNumber') customerRegistrationNumber: string,
    @Query('vehiclePlate') vehiclePlate: string,
  ) {
    return ServiceOrderPresenter.toResponse(
      await this.findByCustomerAndVehicleUseCase.execute({
        registrationNumber: customerRegistrationNumber,
        plate: vehiclePlate,
      }),
    );
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  async lookStatus(@Param('id') id: string) {
    const order = await this.findUseCase.execute({ id });
    if (!order) {
      throw new NotFoundException(`Ordem de serviço ${id} não encontrada`);
    }

    return { status: order.status };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    const order = await this.findUseCase.execute({ id });
    if (!order) {
      throw new NotFoundException(`Ordem de serviço ${id} não encontrada`);
    }
    return ServiceOrderPresenter.toResponse(order);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateServiceOrderDto) {
    const result = await this.createUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(result);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: UpdateServiceOrderDto) {
    const { updatedOrder } = await this.updateUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Body() body: UpdateServiceOrderStatusDto) {
    const { updatedOrderId } = await this.updateStatusUseCase.execute(body);
    const updatedOrder = await this.findUseCase.execute({ id: updatedOrderId });
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteOne(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id: id });
  }

  @Get(':id/approve')
  approve(@Param('id') id: string) {
    return this.approveByEmailUseCase.execute({
      serviceOrderId: id,
      approved: true,
    });
  }

  @Get(':id/reject')
  reject(@Param('id') id: string) {
    return this.approveByEmailUseCase.execute({
      serviceOrderId: id,
      approved: false,
    });
  }
}
