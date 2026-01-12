import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreateCustomerDto } from './dtos/create-customer.dto';
import { CustomerResponseDto } from './dtos/customer-response.dto';
import { CustomerPresenter } from '../presenters/customer.presenter';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { CreateCustomerUseCase } from 'src/application/usecases/customer/create-customer.usecase';
import { FindCustomerUseCase } from 'src/application/usecases/customer/find-customer.usecase';
import { UpdateCustomerUseCase } from 'src/application/usecases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from 'src/application/usecases/customer/delete-customer.usecase';
import { FindAllCustomersUseCase } from 'src/application/usecases/customer/find-all-customers.usecase';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly findCustomerUseCase: FindCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly findAllCustomerUseCase: FindAllCustomersUseCase,
  ) {}

  @Get()
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.findAllCustomerUseCase.execute();

    return customers.map(CustomerPresenter.toResponse);
  }

  @Get('search')
  async find(
    @Query('email') email?: string,
    @Query('registrationNumber') registrationNumber?: string,
  ) {
    if (!email && !registrationNumber) {
      throw new BadRequestException(
        'email or registrationNumber must be provided',
      );
    }

    const customer = await this.findCustomerUseCase.execute({
      email,
      registrationNumber,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return CustomerPresenter.toResponse(customer);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const customer = await this.findCustomerUseCase.execute({ id });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return CustomerPresenter.toResponse(customer);
  }

  @Post()
  async create(@Body() body: CreateCustomerDto): Promise<CustomerResponseDto> {
    const result = await this.createCustomer.execute(body);
    return CustomerPresenter.toResponse(result);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    if (!body.name && !body.email) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const customer = await this.updateCustomerUseCase.execute({
      id,
      ...body,
    });

    return CustomerPresenter.toResponse(customer);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCustomerUseCase.execute({ id });
  }
}
