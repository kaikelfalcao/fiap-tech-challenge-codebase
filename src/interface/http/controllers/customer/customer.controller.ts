import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { CustomerResponseDto } from './dtos/customer-response.dto';
import { CustomerPresenter } from './customer.presenter';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  FindCustomerUseCase,
  ListCustomerUseCase,
  UpdateCustomerUseCase,
} from '@application/customer';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly findCustomer: FindCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly deleteCustomer: DeleteCustomerUseCase,
    private readonly listCustomer: ListCustomerUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;

    const result = await this.listCustomer.execute({
      page: pageNum,
      pageSize: pageSizeNum,
    });

    const data = result.data.map(CustomerPresenter.toResponse);

    return {
      data,
      meta: result.meta,
    };
  }

  @Get('search')
  async find(
    @Query('email') email?: string,
    @Query('registrationNumber') registrationNumber?: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.findCustomer.execute({
      email,
      registrationNumber,
    });
    return CustomerPresenter.toResponse(customer);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CustomerResponseDto> {
    const customer = await this.findCustomer.execute({ id: id });
    return CustomerPresenter.toResponse(customer);
  }

  @Post()
  async create(@Body() body: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.createCustomer.handle(body);
    return CustomerPresenter.toResponse(customer);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomer.execute({ id, ...body });
    return CustomerPresenter.toResponse(customer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCustomer.execute({ id });
  }
}
