import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { FindCustomerUseCase } from '@application/customer/find/find-customer.usecase';
import { ListCustomerUseCase } from '@application/customer/list/list-customer.usecase';
import { CreateCustomerUseCase } from '@application/customer/create/create-customer.usecase';
import { DeleteCustomerUseCase } from '@application/customer/delete/delete-customer.usecase';
import { UpdateCustomerUseCase } from '@application/customer/update/update-customer.usecase';
import { CustomerOrm } from '@infrastructure/database/typeorm/entities/customer.orm';
import { TypeOrmCustomerRepository } from '@infrastructure/database/typeorm/repositories/typeorm-customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrm])],
  controllers: [CustomerController],
  providers: [
    {
      provide: 'CustomerRepository',
      useClass: TypeOrmCustomerRepository,
    },
    FindCustomerUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    ListCustomerUseCase,
  ],
  exports: ['CustomerRepository', FindCustomerUseCase],
})
export class CustomerModule {}
