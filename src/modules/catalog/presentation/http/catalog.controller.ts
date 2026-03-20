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

import { ActivateServiceUseCase } from '../../application/use-cases/activate/activate-service.use-case';
import { DeactivateServiceUseCase } from '../../application/use-cases/deactivate/deactivate-service.use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/delete/delete-service.use-case';
import { GetServiceUseCase } from '../../application/use-cases/get/get-service.use-case';
import type { GetServiceOutput } from '../../application/use-cases/get/get-service.use-case';
import { ListServicesUseCase } from '../../application/use-cases/list/list-services.use-case';
import { RegisterServiceUseCase } from '../../application/use-cases/register/register-service.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update/update-service.use-case';
import type { PaginatedResult } from '../../domain/service.repository';

import { ListServicesDto } from './dtos/list-services.dto';
import { RegisterServiceDto } from './dtos/register-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';

import { RequireRoles } from '@/modules/iam/infrastructure/decorators/roles.decorator';

@Controller('catalog/services')
export class CatalogController {
  constructor(
    private readonly registerService: RegisterServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly activateService: ActivateServiceUseCase,
    private readonly deactivateService: DeactivateServiceUseCase,
    private readonly deleteService: DeleteServiceUseCase,
    private readonly getService: GetServiceUseCase,
    private readonly listServices: ListServicesUseCase,
  ) {}

  @RequireRoles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterServiceDto): Promise<{ id: string }> {
    return this.registerService.execute(dto);
  }

  @RequireRoles('ADMIN')
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ListServicesDto,
  ): Promise<PaginatedResult<GetServiceOutput>> {
    return this.listServices.execute(query);
  }

  @RequireRoles('ADMIN')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<GetServiceOutput> {
    return this.getService.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<void> {
    return this.updateService.execute({ id, ...dto });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Param('id') id: string): Promise<void> {
    return this.activateService.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.deactivateService.execute({ id });
  }

  @RequireRoles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteService.execute({ id });
  }
}
