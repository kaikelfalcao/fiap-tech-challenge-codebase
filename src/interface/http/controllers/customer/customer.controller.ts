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
import { CustomerPresenter } from './customer.presenter';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  FindCustomerUseCase,
  ListCustomerUseCase,
  UpdateCustomerUseCase,
} from '@application/customer';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CustomerResponseDto } from './dtos/customer-response.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly findCustomer: FindCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly deleteCustomer: DeleteCustomerUseCase,
    private readonly listCustomer: ListCustomerUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista clientes com paginação opcional' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Empresa X',
            email: 'contato@empresa.com',
            registrationNumber: '123456789',
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 42,
          totalPages: 5,
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Busca cliente por email ou número de registro' })
  @ApiQuery({ name: 'email', required: false, example: 'contato@empresa.com' })
  @ApiQuery({
    name: 'registrationNumber',
    required: false,
    example: '123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
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
  @ApiOperation({ summary: 'Busca cliente por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findById(@Param('id') id: string): Promise<CustomerResponseDto> {
    const customer = await this.findCustomer.execute({ id });
    return CustomerPresenter.toResponse(customer);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() body: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.createCustomer.handle(body);
    return CustomerPresenter.toResponse(customer);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um cliente existente' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomer.execute({ id, ...body });
    return CustomerPresenter.toResponse(customer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um cliente' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Cliente removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCustomer.execute({ id });
  }
}
