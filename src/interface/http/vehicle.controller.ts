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
import { CreateVehicleUseCase } from 'src/application/usecases/create-vehicle.usecase';
import { UpdateVehicleUseCase } from 'src/application/usecases/update-vehicle.usecase';
import { DeleteVehicleUseCase } from 'src/application/usecases/delete-vehicle.usecase';
import { FindVehicleUseCase } from 'src/application/usecases/find-vehicle.usecase';
import { FindAllVehiclesUseCase } from 'src/application/usecases/find-all-vehicles.usecase';
import { VehicleResponseDto } from './dtos/vehicle-response.dto';
import { VehiclePresenter } from '../presenters/vehicle.presenter';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly findVehicleUseCase: FindVehicleUseCase,
    private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
  ) {}

  @Get()
  async findAll(): Promise<VehicleResponseDto[]> {
    const vehicles = await this.findAllVehiclesUseCase.execute();
    return vehicles.map(VehiclePresenter.toResponse);
  }

  @Get('search')
  async find(@Query('id') id?: string, @Query('plate') plate?: string) {
    if (!id && !plate) {
      throw new BadRequestException('id or plate must be provided');
    }

    const vehicle = await this.findVehicleUseCase.execute({ id, plate });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehiclePresenter.toResponse(vehicle);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const vehicle = await this.findVehicleUseCase.execute({ id });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return VehiclePresenter.toResponse(vehicle);
  }

  @Post()
  async create(@Body() body: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.createVehicleUseCase.execute(body);
    return VehiclePresenter.toResponse(vehicle);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    if (!body.brand && !body.model && !body.year && !body.plate) {
      throw new BadRequestException(
        'At least one field must be provided to update',
      );
    }

    const vehicle = await this.updateVehicleUseCase.execute({
      id,
      ...body,
    });

    return VehiclePresenter.toResponse(vehicle);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute({ id });
  }
}
