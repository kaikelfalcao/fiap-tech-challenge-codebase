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

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { CreateServiceOrderUseCase } from '@application/service-order/create/create-service-order.usecase';
import { CreateServiceOrderDto } from './dtos/create-service-order.dto';
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
import { ServiceOrderResponseDto } from './dtos/service-order.response.dto';

@ApiTags('service-orders')
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista todas as ordens de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens retornada com sucesso',
    type: () => [ServiceOrderResponseDto],
  })
  async findAll() {
    return (await this.findAllUseCase.execute()).map((order) =>
      ServiceOrderPresenter.toResponse(order),
    );
  }

  @Get('/lookup')
  @ApiOperation({ summary: 'Busca ordem por cliente e veículo (público)' })
  @ApiQuery({ name: 'customerRegistrationNumber', example: '123456789' })
  @ApiQuery({ name: 'vehiclePlate', example: 'ABC-1234' })
  @ApiResponse({
    status: 200,
    description: 'Ordem encontrada',
    type: () => ServiceOrderResponseDto,
  })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Consulta status da ordem de serviço' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Status retornado',
    schema: { example: { status: 'APPROVED' } },
  })
  async lookStatus(@Param('id') id: string) {
    const order = await this.findUseCase.execute({ id });
    if (!order) {
      throw new NotFoundException(`Ordem de serviço ${id} não encontrada`);
    }

    return { status: order.status };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Busca ordem de serviço por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Ordem encontrada',
    type: () => ServiceOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async findById(@Param('id') id: string) {
    const order = await this.findUseCase.execute({ id });
    if (!order) {
      throw new NotFoundException(`Ordem de serviço ${id} não encontrada`);
    }
    return ServiceOrderPresenter.toResponse(order);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria uma nova ordem de serviço' })
  @ApiBody({ type: CreateServiceOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Ordem criada com sucesso',
    type: () => ServiceOrderResponseDto,
  })
  async create(@Body() body: CreateServiceOrderDto) {
    const result = await this.createUseCase.execute(body);
    return ServiceOrderPresenter.toResponse(result);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza peças e reparos da ordem' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateServiceOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Ordem atualizada',
    type: () => ServiceOrderResponseDto,
  })
  async update(@Param('id') id: string, @Body() body: UpdateServiceOrderDto) {
    const { updatedOrder } = await this.updateUseCase.execute({
      serviceOrderId: id,
      parts: body.parts,
      repairs: body.repairs,
    });
    return ServiceOrderPresenter.toResponse(updatedOrder);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza status da ordem' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateServiceOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado',
    type: () => ServiceOrderResponseDto,
  })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove uma ordem de serviço' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 204, description: 'Ordem removida com sucesso' })
  async deleteOne(@Param('id') id: string) {
    await this.deleteUseCase.execute({ id: id });
  }

  @Get(':id/approve')
  @ApiOperation({ summary: 'Aprova ordem via link de e-mail' })
  @ApiParam({ name: 'id', example: 'uuid' })
  async approve(@Param('id') id: string) {
    return this.approveByEmailUseCase.execute({
      serviceOrderId: id,
      approved: true,
    });
  }

  @Get(':id/reject')
  @ApiOperation({ summary: 'Rejeita ordem via link de e-mail' })
  @ApiParam({ name: 'id', example: 'uuid' })
  async reject(@Param('id') id: string) {
    return this.approveByEmailUseCase.execute({
      serviceOrderId: id,
      approved: false,
    });
  }
}
