import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCustomerUseCase } from '../../../application/use-cases/customer/create-customer.usecase';
import { GetCustomerUseCase } from '../../../application/use-cases/customer/get-customer.usecase';
import { ListCustomersUseCase } from '../../../application/use-cases/customer/list-customers.usecase';
import { UpdateCustomerUseCase } from '../../../application/use-cases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from '../../../application/use-cases/customer/delete-customer.usecase';
import {
  CreateCustomerRequestDto,
  CustomerResponse,
  UpdateCustomerRequestDto,
} from '../dtos/customer.dto';
import { UUID } from 'node:crypto';
import { DomainError } from '../../../domain/errors/domain.error';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly create: CreateCustomerUseCase,
    private readonly get: GetCustomerUseCase,
    private readonly list: ListCustomersUseCase,
    private readonly update: UpdateCustomerUseCase,
    private readonly remove: DeleteCustomerUseCase,
  ) {}

  @Post()
  async createOne(
    @Body() dto: CreateCustomerRequestDto,
  ): Promise<CustomerResponse> {
    try {
      return new CustomerResponse(await this.create.execute(dto));
    } catch (err) {
      if (err instanceof DomainError)
        throw new BadRequestException(err.message);
      throw err;
    }
  }

  @Get(':uuid')
  async getOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return new CustomerResponse(await this.get.execute(<UUID>uuid));
  }

  @Get()
  async getAll() {
    const customers = await this.list.execute();
    return customers.map((customer) => new CustomerResponse(customer));
  }

  @Patch(':uuid')
  async updateOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() body: UpdateCustomerRequestDto,
  ) {
    return new CustomerResponse(
      await this.update.execute({ ...body, id: uuid as UUID }),
    );
  }

  @Delete(':uuid')
  async deleteOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.remove.execute(<UUID>uuid);
  }
}
