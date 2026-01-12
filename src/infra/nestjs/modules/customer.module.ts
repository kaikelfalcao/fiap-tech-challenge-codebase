import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/application/ports/customer.repository';
import { CreateCustomerUseCase } from 'src/application/usecases/create-customer.usecase';
import { DeleteCustomerUseCase } from 'src/application/usecases/delete-customer.usecase';
import { FindAllCustomersUseCase } from 'src/application/usecases/find-all-customers.usecase';
import { FindCustomerUseCase } from 'src/application/usecases/find-customer.usecase';
import { UpdateCustomerUseCase } from 'src/application/usecases/update-customer.usecase';
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
    {
      provide: CreateCustomerUseCase,
      useFactory: (repo: CustomerRepository) => new CreateCustomerUseCase(repo),
      inject: ['CustomerRepository'],
    },
    {
      provide: FindAllCustomersUseCase,
      useFactory: (repo: CustomerRepository) =>
        new FindAllCustomersUseCase(repo),
      inject: ['CustomerRepository'],
    },
    {
      provide: FindCustomerUseCase,
      useFactory: (repo: CustomerRepository) => new FindCustomerUseCase(repo),
      inject: ['CustomerRepository'],
    },
    {
      provide: UpdateCustomerUseCase,
      useFactory: (repo: CustomerRepository) => new UpdateCustomerUseCase(repo),
      inject: ['CustomerRepository'],
    },
    {
      provide: DeleteCustomerUseCase,
      useFactory: (repo: CustomerRepository) => new DeleteCustomerUseCase(repo),
      inject: ['CustomerRepository'],
    },
  ],
})
export class CustomerModule {}
