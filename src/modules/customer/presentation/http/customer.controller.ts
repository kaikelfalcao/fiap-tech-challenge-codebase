import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ActivateCustomerUseCase } from '../../application/use-cases/activate/activate-customer.use-case';
import { DeactivateCustomerUseCase } from '../../application/use-cases/deactivate/deactivate-customer.use-case';
import { DeleteCustomerUseCase } from '../../application/use-cases/delete/delete-customer.use-case';
import { GetCustomerUseCase } from '../../application/use-cases/get/get-customer.use-case';
import { ListCustomersUseCase } from '../../application/use-cases/list/list-customers.use-case';
import { RegisterCustomerUseCase } from '../../application/use-cases/register/register-customer.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/update/update-customer.use-case';

import type {
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from './dtos/customer.response.dto';
import { ListCustomersDto } from './dtos/list-customers.dto';
import { RegisterCustomerDto } from './dtos/register-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';

import { RequireRoles } from '@/modules/iam/infrastructure/decorators/roles.decorator';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly registerCustomer: RegisterCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly activateCustomer: ActivateCustomerUseCase,
    private readonly deactivateCustomer: DeactivateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
    private readonly deleteCustomer: DeleteCustomerUseCase,
    private readonly listCustomers: ListCustomersUseCase,
  ) {}

  @RequireRoles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterCustomerDto): Promise<{ id: string }> {
    return this.registerCustomer.execute(dto);
  }

  @RequireRoles('ADMIN')
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ListCustomersDto,
  ): Promise<PaginatedCustomersResponseDto> {
    return this.listCustomers.execute(query);
  }

  @RequireRoles('ADMIN')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.getCustomer.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<void> {
    return this.updateCustomer.execute({ id, ...dto });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Param('id') id: string): Promise<void> {
    return this.activateCustomer.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.deactivateCustomer.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteCustomer.execute({ id });
  }
}
