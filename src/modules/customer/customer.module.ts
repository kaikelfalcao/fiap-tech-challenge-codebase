import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivateCustomerUseCase } from './application/use-cases/activate/activate-customer.use-case';
import { DeactivateCustomerUseCase } from './application/use-cases/deactivate/deactivate-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete/delete-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get/get-customer.use-case';
import { ListCustomersUseCase } from './application/use-cases/list/list-customers.use-case';
import { RegisterCustomerUseCase } from './application/use-cases/register/register-customer.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update/update-customer.use-case';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { CustomerOrmEntity } from './infrastructure/persistence/customer.typeorm.entity';
import { CustomerTypeOrmRepository } from './infrastructure/persistence/customer.typeorm.repository';
import { CustomerController } from './presentation/http/customer.controller';
import { CUSTOMER_PUBLIC_API } from './public/customer.public-api';
import { CustomerPublicApiService } from './public/customer.public-api.service';

const USE_CASES = [
  RegisterCustomerUseCase,
  UpdateCustomerUseCase,
  ActivateCustomerUseCase,
  DeactivateCustomerUseCase,
  GetCustomerUseCase,
  DeleteCustomerUseCase,
  ListCustomersUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerTypeOrmRepository,
    },
    ...USE_CASES,
    {
      provide: CUSTOMER_PUBLIC_API,
      useClass: CustomerPublicApiService,
    },
  ],
  exports: [CUSTOMER_PUBLIC_API],
})
export class CustomerModule {}
