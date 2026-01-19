import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CreateVehicleUseCase } from '@application/vehicle/create/create-vehicle.usecase';
import { UpdateVehicleUseCase } from '@application/vehicle/update/update-vehicle.usecase';
import { DeleteVehicleUseCase } from '@application/vehicle/delete/delete-vehicle.usecase';
import { FindVehicleUseCase } from '@application/vehicle/find/find-vehicle.usecase';
import { ListVehicleUseCase } from '@application/vehicle/list/list-vehicle.usecase';

import { VehicleResponseDto } from './dtos/vehicle-response.dto';
import { VehiclePresenter } from './vehicle.presenter';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';

import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly createVehicle: CreateVehicleUseCase,
    private readonly updateVehicle: UpdateVehicleUseCase,
    private readonly deleteVehicle: DeleteVehicleUseCase,
    private readonly findVehicle: FindVehicleUseCase,
    private readonly listVehicles: ListVehicleUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista veículos com paginação opcional' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de veículos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            plate: 'ABC-1234',
            customerId: 'uuid-do-cliente',
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 25,
          totalPages: 3,
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

    const result = await this.listVehicles.execute({
      page: pageNum,
      pageSize: pageSizeNum,
    });

    const data = result.data.map(VehiclePresenter.toResponse);

    return {
      data,
      meta: result.meta,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca veículo por id ou placa' })
  @ApiQuery({ name: 'id', required: false, example: 'uuid' })
  @ApiQuery({ name: 'plate', required: false, example: 'ABC-1234' })
  @ApiResponse({
    status: 200,
    description: 'Veículo encontrado',
    type: () => VehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'id ou plate devem ser informados',
  })
  @ApiResponse({
    status: 404,
    description: 'Veículo não encontrado',
  })
  async find(@Query('id') id?: string, @Query('plate') plate?: string) {
    if (!id && !plate) {
      throw new BadRequestException('id or plate must be provided');
    }

    const vehicle = await this.findVehicle.execute({ id, plate });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehiclePresenter.toResponse(vehicle);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca veículo por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Veículo encontrado',
    type: () => VehicleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Veículo não encontrado',
  })
  async findById(@Param('id') id: string) {
    const vehicle = await this.findVehicle.execute({ id });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehiclePresenter.toResponse(vehicle);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo veículo' })
  @ApiBody({ type: CreateVehicleDto })
  @ApiResponse({
    status: 201,
    description: 'Veículo criado com sucesso',
    type: () => VehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() body: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.createVehicle.execute(body);
    return VehiclePresenter.toResponse(vehicle);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um veículo existente' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiResponse({
    status: 200,
    description: 'Veículo atualizado com sucesso',
    type: () => VehicleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhum campo informado para atualização',
  })
  @ApiResponse({
    status: 404,
    description: 'Veículo não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    if (!body.brand && !body.model && !body.year && !body.plate) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const vehicle = await this.updateVehicle.execute({
      id,
      ...body,
    });

    return VehiclePresenter.toResponse(vehicle);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um veículo' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Veículo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Veículo não encontrado',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteVehicle.execute({ id });
  }
}
