import { FindVehicleUseCase } from '@application/vehicle/find/find-vehicle.usecase';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartModule } from './part.module';
import { RepairModule } from './repair.module';
import { VehicleModule } from '../../../interface/http/vehicle/vehicle.module';
import { CustomerModule } from '../../../interface/http/customer/customer.module';
import { ServiceOrderController } from 'src/interface/http/service-order.controller';
import { FindCustomerUseCase } from '@application/customer/find/find-customer.usecase';
import { ReservePartsUseCase } from 'src/application/usecases/part/reserve-part.usecase';
import { GetRepairsUseCase } from 'src/application/usecases/repair/get-repair.usecase';
import { CreateServiceOrderUseCase } from 'src/application/usecases/service-order/create-service-order.usecase';
import { UpdateServiceOrderUseCase } from 'src/application/usecases/service-order/update-service-order.usecase';
import { UpdateServiceOrderStatusUseCase } from 'src/application/usecases/service-order/update-service-order-status.usecase';
import { FindServiceOrderUseCase } from 'src/application/usecases/service-order/find-service-order.usecase';
import { FindAllServiceOrderUseCase } from 'src/application/usecases/service-order/find-all-service-order.usecase';
import { DeleteServiceOrderUseCase } from 'src/application/usecases/service-order/delete-service-order.usecase';
import { FindByCustomerAndVehicleServiceOrderUseCase } from 'src/application/usecases/service-order/find-by-customer-and-vehicle-service-order.usecase';
import { ApproveServiceOrderByEmailUseCase } from 'src/application/usecases/service-order/approve-service-order-by-email.usecase';
import { TypeOrmServiceOrderRepository } from '@infrastructure/database/typeorm/repositories/typeorm-service-order.repository';
import { RepairsOnServiceOrdersOrm } from '@infrastructure/database/typeorm/entities/repairs-on-service-orders.orm';
import { PartsOnServiceOrdersOrm } from '@infrastructure/database/typeorm/entities/parts-on-service-orders.orm';
import { ServiceOrderOrm } from '@infrastructure/database/typeorm/entities/service-order.orm';

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
  ],
  controllers: [ServiceOrderController],
  providers: [
    {
      provide: 'ServiceOrderRepository',
      useClass: TypeOrmServiceOrderRepository,
    },
    FindCustomerUseCase,
    FindVehicleUseCase,
    ReservePartsUseCase,
    GetRepairsUseCase,

    CreateServiceOrderUseCase,
    UpdateServiceOrderUseCase,
    UpdateServiceOrderStatusUseCase,
    FindServiceOrderUseCase,
    FindAllServiceOrderUseCase,
    DeleteServiceOrderUseCase,
    FindByCustomerAndVehicleServiceOrderUseCase,
    ApproveServiceOrderByEmailUseCase,
  ],
})
export class ServiceOrderModule {}
