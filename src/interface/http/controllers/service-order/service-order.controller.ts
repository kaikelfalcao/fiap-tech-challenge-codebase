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
  Put,
} from '@nestjs/common';
import { CreateServiceOrderUseCase } from '@application/service-order/create/create-service-order.usecase';
import type { CreateServiceOrderDto } from './dtos/create-service-order.dto';
import { ServiceOrderPresenter } from './service-order.presenter';
import { UpdateServiceOrderDto } from './dtos/update-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dtos/update-service-order-status';
import { UpdateServiceOrderStatusUseCase } from '@application/service-order/update-status/update-service-order-status.usecase';
import { FindServiceOrderUseCase } from '@application/service-order/find/find-service-order.usecase';
import { ListServiceOrderUseCase } from '@application/service-order/list/list-service-order.usecase';
import { DeleteServiceOrderUseCase } from '@application/service-order/delete/delete-service-order.usecase';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';
import { FindByCustomerAndVehicleServiceOrderUseCase } from '@application/service-order/find-customer-vehicle/find-by-customer-and-vehicle-service-order.usecase';
import { UpdateServiceOrderUseCase } from '@application/service-order/update/update-service-order.usecase';
import { ApproveServiceOrderByEmailUseCase } from '@application/service-order/approve/approve-service-order-by-email.usecase';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private createUseCase: CreateServiceOrderUseCase,
    private updateUseCase: UpdateServiceOrderUseCase,
    private readonly updateStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly findUseCase: FindServiceOrderUseCase,
    private readonly findAllUseCase: ListServiceOrderUseCase,
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: UpdateServiceOrderDto) {
    const { updatedOrder } = await this.updateUseCase.execute({
      serviceOrderId: id,
      parts: body.parts,
      repairs: body.repairs,
    });
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateServiceOrderStatusDto,
  ) {
    const { updatedOrderId } = await this.updateStatusUseCase.execute({
      serviceOrderId: id,
      newStatus: body.newStatus,
    });
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
