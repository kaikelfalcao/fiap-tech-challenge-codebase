import { FindVehicleUseCase } from '@application/vehicle/find/find-vehicle.usecase';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartModule } from '../part/part.module';
import { RepairModule } from '../repair/repair.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { CustomerModule } from '../customer/customer.module';
import { ServiceOrderController } from '@interface/http/controllers/service-order/service-order.controller';
import { FindCustomerUseCase } from '@application/customer/find/find-customer.usecase';
import { ReservePartUseCase } from '@application/part/reserve/reserve-part.usecase';
import { CalculateRepairCostsUseCase } from '@application/repair/calculate-repair-cost/calculate-repair-cost.usecase';
import { CreateServiceOrderUseCase } from '@application/service-order/create/create-service-order.usecase';
import { UpdateServiceOrderStatusUseCase } from '@application/service-order/update-status/update-service-order-status.usecase';
import { FindServiceOrderUseCase } from '@application/service-order/find/find-service-order.usecase';
import { ListServiceOrderUseCase } from '@application/service-order/list/list-service-order.usecase';
import { DeleteServiceOrderUseCase } from '@application/service-order/delete/delete-service-order.usecase';
import { TypeOrmServiceOrderRepository } from '@infrastructure/database/typeorm/repositories/typeorm-service-order.repository';
import { RepairsOnServiceOrdersOrm } from '@infrastructure/database/typeorm/entities/repairs-on-service-orders.orm';
import { PartsOnServiceOrdersOrm } from '@infrastructure/database/typeorm/entities/parts-on-service-orders.orm';
import { ServiceOrderOrm } from '@infrastructure/database/typeorm/entities/service-order.orm';
import { UpdateServiceOrderUseCase } from '@application/service-order/update/update-service-order.usecase';
import { FindByCustomerAndVehicleServiceOrderUseCase } from '@application/service-order/find-customer-vehicle/find-by-customer-and-vehicle-service-order.usecase';
import { ApproveServiceOrderByEmailUseCase } from '@application/service-order/approve/approve-service-order-by-email.usecase';
import { NotificationModule } from '@infrastructure/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceOrderOrm,
      PartsOnServiceOrdersOrm,
      RepairsOnServiceOrdersOrm,
    ]),
    PartModule,
    RepairModule,
    VehicleModule,
    CustomerModule,
    NotificationModule,
  ],
  controllers: [ServiceOrderController],
  providers: [
    {
      provide: 'ServiceOrderRepository',
      useClass: TypeOrmServiceOrderRepository,
    },
    FindCustomerUseCase,
    FindVehicleUseCase,
    ReservePartUseCase,
    CalculateRepairCostsUseCase,

    CreateServiceOrderUseCase,
    UpdateServiceOrderUseCase,
    UpdateServiceOrderStatusUseCase,
    FindServiceOrderUseCase,
    ListServiceOrderUseCase,
    DeleteServiceOrderUseCase,
    FindByCustomerAndVehicleServiceOrderUseCase,
    ApproveServiceOrderByEmailUseCase,
  ],
})
export class ServiceOrderModule {}
