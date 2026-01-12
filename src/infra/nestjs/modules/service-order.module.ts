import { FindVehicleUseCase } from 'src/application/usecases/vehicle/find-vehicle.usecase';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsOnServiceOrdersOrm } from 'src/infra/typeorm/entities/parts-on-service-orders.orm';
import { RepairsOnServiceOrdersOrm } from 'src/infra/typeorm/entities/repairs-on-service-orders.orm';
import { ServiceOrderOrm } from 'src/infra/typeorm/entities/service-order.orm';
import { PartModule } from './part.module';
import { RepairModule } from './repair.module';
import { VehicleModule } from './vehicle.module';
import { CustomerModule } from './customer.module';
import { ServiceOrderController } from 'src/interface/http/service-order.controller';
import { TypeOrmServiceOrderRepository } from 'src/infra/typeorm/repositories/typeorm-service-order.repository';
import { FindCustomerUseCase } from 'src/application/usecases/customer/find-customer.usecase';
import { ReservePartsUseCase } from 'src/application/usecases/part/reserve-part.usecase';
import { GetRepairsUseCase } from 'src/application/usecases/repair/get-repair.usecase';
import { CreateServiceOrderUseCase } from 'src/application/usecases/service-order/create-service-order.usecase';
import { UpdateServiceOrderUseCase } from 'src/application/usecases/service-order/update-service-order.usecase';
import { UpdateServiceOrderStatusUseCase } from 'src/application/usecases/service-order/update-service-order-status.usecase';
import { FindServiceOrderUseCase } from 'src/application/usecases/service-order/find-service-order.usecase';
import { FindAllServiceOrderUseCase } from 'src/application/usecases/service-order/find-all-service-order.usecase';
import { DeleteServiceOrderUseCase } from 'src/application/usecases/service-order/delete-service-order.usecase';
import { FindByCustomerAndVehicleServiceOrderUseCase } from 'src/application/usecases/service-order/find-by-customer-and-vehicle-service-order.usecase';

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
  ],
})
export class ServiceOrderModule {}
