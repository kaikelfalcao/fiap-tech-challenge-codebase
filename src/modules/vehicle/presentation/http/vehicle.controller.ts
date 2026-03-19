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

import { DeleteVehicleUseCase } from '../../application/use-cases/delete/delete-vehicle.use-case';
import { GetVehicleUseCase } from '../../application/use-cases/get/get-vehicle.use-case';
import { ListVehiclesUseCase } from '../../application/use-cases/list/list-vehicles.use-case';
import { RegisterVehicleUseCase } from '../../application/use-cases/register/register-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update/update-vehicle.use-case';

import { ListVehiclesDto } from './dtos/list-vehicles.dto';
import { RegisterVehicleDto } from './dtos/register-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import type {
  VehicleResponseDto,
  PaginatedVehiclesResponseDto,
} from './dtos/vehicle.response.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly registerVehicle: RegisterVehicleUseCase,
    private readonly updateVehicle: UpdateVehicleUseCase,
    private readonly deleteVehicle: DeleteVehicleUseCase,
    private readonly getVehicle: GetVehicleUseCase,
    private readonly listVehicles: ListVehiclesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterVehicleDto): Promise<{ id: string }> {
    return this.registerVehicle.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ListVehiclesDto,
  ): Promise<PaginatedVehiclesResponseDto> {
    return this.listVehicles.execute(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<VehicleResponseDto> {
    return this.getVehicle.execute({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<void> {
    return this.updateVehicle.execute({ id, ...dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteVehicle.execute({ id });
  }
}
