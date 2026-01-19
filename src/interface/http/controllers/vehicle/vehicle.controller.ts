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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    const vehicle = await this.findVehicle.execute({ id });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehiclePresenter.toResponse(vehicle);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.createVehicle.execute(body);
    return VehiclePresenter.toResponse(vehicle);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteVehicle.execute({ id });
  }
}
