import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { AddItemToOrderUseCase } from '../../application/use-cases/add-item/add-item-to-order.use-case';
import { AddServiceToOrderUseCase } from '../../application/use-cases/add-service/add-service-to-order.use-case';
import { ApproveBudgetUseCase } from '../../application/use-cases/approve-budget/approve-budget.use-case';
import { DeliverServiceOrderUseCase } from '../../application/use-cases/deliver/deliver-service-order.use-case';
import { FinalizeServiceOrderUseCase } from '../../application/use-cases/finalize/finalize-service-order.use-case';
import { GetServiceOrderUseCase } from '../../application/use-cases/get/get-service-order.use-case';
import { GetServiceOrderByCustomerUseCase } from '../../application/use-cases/get-by-customer/get-service-order-by-customer.use-case';
import { ListServiceOrdersUseCase } from '../../application/use-cases/list/list-service-orders.use-case';
import { ListServiceOrdersByTaxIdUseCase } from '../../application/use-cases/list-by-taxid/list-service-orders-by-taxid.use-case';
import { OpenServiceOrderUseCase } from '../../application/use-cases/open/open-service-order.use-case';
import { RejectBudgetUseCase } from '../../application/use-cases/reject-budget/reject-budget.use-case';
import { RemoveItemFromOrderUseCase } from '../../application/use-cases/remove-item/remove-item-from-order.use-case';
import { RemoveServiceFromOrderUseCase } from '../../application/use-cases/remove-service/remove-service-from-order.use-case';
import { SendBudgetUseCase } from '../../application/use-cases/send-budget/send-budget.use-case';
import { StartDiagnosisUseCase } from '../../application/use-cases/start-diagnosis/start-diagnosis.use-case';

import { AddItemDto } from './dtos/add-item.dto';
import { AddServiceDto } from './dtos/add-service.dto';
import { ApproveBudgetDto } from './dtos/approve-budget.dto';
import { ListServiceOrdersDto } from './dtos/list-service-orders.dto';
import { OpenServiceOrderDto } from './dtos/open-service-order.dto';

import { Public } from '@/modules/iam/infrastructure/decorators/public.decorator';
import { RequireRoles } from '@/modules/iam/infrastructure/decorators/roles.decorator';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly openOrder: OpenServiceOrderUseCase,
    private readonly addService: AddServiceToOrderUseCase,
    private readonly removeService: RemoveServiceFromOrderUseCase,
    private readonly addItem: AddItemToOrderUseCase,
    private readonly removeItem: RemoveItemFromOrderUseCase,
    private readonly startDiagnosis: StartDiagnosisUseCase,
    private readonly sendBudget: SendBudgetUseCase,
    private readonly approveBudget: ApproveBudgetUseCase,
    private readonly rejectBudget: RejectBudgetUseCase,
    private readonly finalizeOrder: FinalizeServiceOrderUseCase,
    private readonly deliverOrder: DeliverServiceOrderUseCase,
    private readonly getOrder: GetServiceOrderUseCase,
    private readonly listOrders: ListServiceOrdersUseCase,
    private readonly getOrderByCustomer: GetServiceOrderByCustomerUseCase,
    private readonly listOrdersByTaxId: ListServiceOrdersByTaxIdUseCase,
  ) {}

  // --- CRUD principal ---

  @RequireRoles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async open(@Body() dto: OpenServiceOrderDto) {
    return this.openOrder.execute(dto);
  }

  @RequireRoles('ADMIN')
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ListServiceOrdersDto) {
    return this.listOrders.execute(query);
  }

  @RequireRoles('ADMIN')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string) {
    return this.getOrder.execute({ id });
  }

  // --- Serviços na OS ---

  @RequireRoles('ADMIN')
  @Post(':id/services')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addServiceToOrder(
    @Param('id') orderId: string,
    @Body() dto: AddServiceDto,
  ) {
    return this.addService.execute({ orderId, ...dto });
  }

  @RequireRoles('ADMIN')
  @Delete(':id/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeServiceFromOrder(
    @Param('id') orderId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.removeService.execute({ orderId, serviceId });
  }

  // --- Itens na OS ---

  @RequireRoles('ADMIN')
  @Post(':id/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addItemToOrder(@Param('id') orderId: string, @Body() dto: AddItemDto) {
    return this.addItem.execute({ orderId, ...dto });
  }

  @RequireRoles('ADMIN')
  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItemFromOrder(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.removeItem.execute({ orderId, itemId });
  }

  // --- Transições de status ---

  @RequireRoles('ADMIN')
  @Patch(':id/start-diagnosis')
  @HttpCode(HttpStatus.NO_CONTENT)
  async startDiagnosisRoute(@Param('id') orderId: string) {
    return this.startDiagnosis.execute({ orderId });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/send-budget')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendBudgetRoute(@Param('id') orderId: string) {
    return this.sendBudget.execute({ orderId });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/budget-response')
  @HttpCode(HttpStatus.NO_CONTENT)
  async budgetResponse(
    @Param('id') orderId: string,
    @Body() dto: ApproveBudgetDto,
  ) {
    if (dto.approved) {
      return this.approveBudget.execute({ orderId });
    }
    return this.rejectBudget.execute({ orderId });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/finalize')
  @HttpCode(HttpStatus.NO_CONTENT)
  async finalize(@Param('id') orderId: string) {
    return this.finalizeOrder.execute({ orderId });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/deliver')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deliver(@Param('id') orderId: string) {
    return this.deliverOrder.execute({ orderId });
  }

  @Public()
  @Get('customer/:taxId/:orderId')
  @HttpCode(HttpStatus.OK)
  async getByCustomer(
    @Param('taxId') taxId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.getOrderByCustomer.execute({ taxId, orderId });
  }

  @Public()
  @Get('customer/:taxId')
  @HttpCode(HttpStatus.OK)
  async listByCustomer(
    @Param('taxId') taxId: string,
    @Query() query: ListServiceOrdersDto,
  ) {
    return this.listOrdersByTaxId.execute({ taxId, ...query });
  }
}
