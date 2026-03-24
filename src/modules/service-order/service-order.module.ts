import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddItemToOrderUseCase } from './application/use-cases/add-item/add-item-to-order.use-case';
import { AddServiceToOrderUseCase } from './application/use-cases/add-service/add-service-to-order.use-case';
import { ApproveBudgetUseCase } from './application/use-cases/approve-budget/approve-budget.use-case';
import { DeliverServiceOrderUseCase } from './application/use-cases/deliver/deliver-service-order.use-case';
import { FinalizeServiceOrderUseCase } from './application/use-cases/finalize/finalize-service-order.use-case';
import { GetServiceOrderUseCase } from './application/use-cases/get/get-service-order.use-case';
import { GetServiceOrderByCustomerUseCase } from './application/use-cases/get-by-customer/get-service-order-by-customer.use-case';
import { ListServiceOrdersUseCase } from './application/use-cases/list/list-service-orders.use-case';
import { ListServiceOrdersByTaxIdUseCase } from './application/use-cases/list-by-taxid/list-service-orders-by-taxid.use-case';
import { OpenServiceOrderUseCase } from './application/use-cases/open/open-service-order.use-case';
import { RejectBudgetUseCase } from './application/use-cases/reject-budget/reject-budget.use-case';
import { RemoveItemFromOrderUseCase } from './application/use-cases/remove-item/remove-item-from-order.use-case';
import { RemoveServiceFromOrderUseCase } from './application/use-cases/remove-service/remove-service-from-order.use-case';
import { SendBudgetUseCase } from './application/use-cases/send-budget/send-budget.use-case';
import { StartDiagnosisUseCase } from './application/use-cases/start-diagnosis/start-diagnosis.use-case';
import { SERVICE_ORDER_REPOSITORY } from './domain/service-order.repository';
import { ServiceOrderOrmEntity } from './infrastructure/persistence/service-order.typeorm.entity';
import { ServiceOrderTypeOrmRepository } from './infrastructure/persistence/service-order.typeorm.repository';
import { ServiceOrderController } from './presentation/http/service-order.controller';

import { CatalogModule } from '@/modules/catalog/catalog.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { VehicleModule } from '@/modules/vehicle/vehicle.module';

const USE_CASES = [
  OpenServiceOrderUseCase,
  AddServiceToOrderUseCase,
  RemoveServiceFromOrderUseCase,
  AddItemToOrderUseCase,
  RemoveItemFromOrderUseCase,
  StartDiagnosisUseCase,
  SendBudgetUseCase,
  ApproveBudgetUseCase,
  RejectBudgetUseCase,
  FinalizeServiceOrderUseCase,
  DeliverServiceOrderUseCase,
  GetServiceOrderUseCase,
  ListServiceOrdersUseCase,
  ListServiceOrdersByTaxIdUseCase,
  GetServiceOrderByCustomerUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrderOrmEntity]),
    CustomerModule,
    VehicleModule,
    CatalogModule,
    InventoryModule,
  ],
  controllers: [ServiceOrderController],
  providers: [
    {
      provide: SERVICE_ORDER_REPOSITORY,
      useClass: ServiceOrderTypeOrmRepository,
    },
    ...USE_CASES,
  ],
})
export class ServiceOrderModule {}
