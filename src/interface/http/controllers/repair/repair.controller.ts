import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  CreateRepairUseCase,
  DeleteRepairUseCase,
  FindRepairUseCase,
  ListRepairUseCase,
  UpdateRepairUseCase,
} from '@application/repair';

import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CreateRepairDto } from './dtos/create-repair.dto';
import { UpdateRepairDto } from './dtos/update-repair.dto';
import { RepairResponseDto } from './dtos/repair-response.dto';
import { RepairPresenter } from './repair.presenter';

@ApiTags('repairs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('repairs')
export class RepairController {
  constructor(
    private readonly createRepair: CreateRepairUseCase,
    private readonly updateRepair: UpdateRepairUseCase,
    private readonly deleteRepair: DeleteRepairUseCase,
    private readonly findRepair: FindRepairUseCase,
    private readonly listRepair: ListRepairUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo reparo' })
  @ApiBody({ type: CreateRepairDto })
  @ApiResponse({
    status: 201,
    description: 'Reparo criado com sucesso',
    type: () => RepairResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() body: CreateRepairDto): Promise<RepairResponseDto> {
    const repair = await this.createRepair.execute(body);
    return RepairPresenter.toResponse(repair);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um reparo existente' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateRepairDto })
  @ApiResponse({
    status: 200,
    description: 'Reparo atualizado com sucesso',
    type: () => RepairResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reparo não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRepairDto,
  ): Promise<RepairResponseDto> {
    const repair = await this.updateRepair.execute({ id, ...body });
    return RepairPresenter.toResponse(repair);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um reparo' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Reparo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Reparo não encontrado',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteRepair.execute({ id });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um reparo por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Reparo encontrado',
    type: () => RepairResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reparo não encontrado',
  })
  async find(@Param('id') id: string): Promise<RepairResponseDto | null> {
    const repair = await this.findRepair.execute({ id });
    return RepairPresenter.toResponse(repair);
  }

  @Get()
  @ApiOperation({ summary: 'Lista reparos com paginação opcional' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de reparos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            description: 'Troca de embreagem',
            cost: 1200.5,
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 12,
          totalPages: 2,
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

    const result = await this.listRepair.execute({
      page: pageNum,
      pageSize: pageSizeNum,
    });

    return {
      data: result.data.map(RepairPresenter.toResponse),
      meta: result.meta,
    };
  }
}
