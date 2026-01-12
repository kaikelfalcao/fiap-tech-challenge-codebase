import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCustomerUseCase } from 'src/application/usecases/customer/create-customer.usecase';
import { DeleteCustomerUseCase } from 'src/application/usecases/customer/delete-customer.usecase';
import { FindAllCustomersUseCase } from 'src/application/usecases/customer/find-all-customers.usecase';
import { FindCustomerUseCase } from 'src/application/usecases/customer/find-customer.usecase';
import { UpdateCustomerUseCase } from 'src/application/usecases/customer/update-customer.usecase';
import { CustomerOrm } from 'src/infra/typeorm/entities/customer.orm';
import { TypeOrmCustomerRepository } from 'src/infra/typeorm/repositories/typeorm-customer.repository';
import { CustomerController } from 'src/interface/http/customer.controller';

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
    FindAllCustomersUseCase,
  ],
  exports: ['CustomerRepository', FindCustomerUseCase],
})
export class CustomerModule {}
