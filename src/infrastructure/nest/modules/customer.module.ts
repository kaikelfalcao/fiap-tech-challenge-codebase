import { Module } from '@nestjs/common';
import { CustomerController } from '../http/customer.controller';
import { CustomerRepositoryImpl } from '../../persistence/typeorm/repositories/customer.repository.impl';
import { CreateCustomerUseCase } from '../../../application/use-cases/customer/create-customer.usecase';
import { GetCustomerUseCase } from '../../../application/use-cases/customer/get-customer.usecase';
import { ListCustomersUseCase } from '../../../application/use-cases/customer/list-customers.usecase';
import { UpdateCustomerUseCase } from '../../../application/use-cases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from '../../../application/use-cases/customer/delete-customer.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerTypeOrmEntity } from '../../persistence/typeorm/entities/customer.typeorm.entity';
import { CUSTOMER_REPOSITORY } from './tokens';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerTypeOrmEntity])],
  controllers: [CustomerController],
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepositoryImpl },
    CreateCustomerUseCase,
    GetCustomerUseCase,
    ListCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
})
export class CustomerModule {}
