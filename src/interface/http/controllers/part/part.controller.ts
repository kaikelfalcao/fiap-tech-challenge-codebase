import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { CreatePartUseCase } from '@application/part/create/create-part.usecase';
import { UpdatePartUseCase } from '@application/part/update/update-part.usecase';
import { DeletePartUseCase } from '@application/part/delete/delete-part.usecase';
import { FindPartUseCase } from '@application/part/find/find-part.usecase';
import { ListPartUseCase } from '@application/part/list/list-part.usecase';

import { PartPresenter } from './part.presenter';
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

import { CreatePartDto } from './dtos/create-part.dto';
import { UpdatePartDto } from './dtos/update-part.dto';
import { PartResponseDto } from './dtos/part-response.dto';

@ApiTags('parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartController {
  constructor(
    private createPart: CreatePartUseCase,
    private updatePart: UpdatePartUseCase,
    private deletePart: DeletePartUseCase,
    private findPart: FindPartUseCase,
    private listPart: ListPartUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova peça' })
  @ApiBody({ type: CreatePartDto })
  @ApiResponse({
    status: 201,
    description: 'Peça criada com sucesso',
    type: () => PartResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() body: CreatePartDto): Promise<PartResponseDto> {
    const part = await this.createPart.execute(body);
    return PartPresenter.toResponse(part);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma peça existente' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdatePartDto })
  @ApiResponse({
    status: 200,
    description: 'Peça atualizada com sucesso',
    type: () => PartResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Peça não encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePartDto,
  ): Promise<PartResponseDto> {
    const part = await this.updatePart.execute({ ...body, id });
    return PartPresenter.toResponse(part);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma peça' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Peça removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Peça não encontrada',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deletePart.execute({ id });
  }

  @Get()
  @ApiOperation({ summary: 'Lista peças com paginação opcional' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de peças retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Filtro de óleo',
            code: 'FR-1234',
            price: 49.9,
            stock: 100,
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

    const result = await this.listPart.execute({
      page: pageNum,
      pageSize: pageSizeNum,
    });

    const data = result.data.map((part) => PartPresenter.toResponse(part));

    return {
      data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma peça por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Peça encontrada',
    type: () => PartResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Peça não encontrada',
  })
  async find(@Param('id') id: string): Promise<PartResponseDto> {
    const part = await this.findPart.execute({ id });
    if (!part) throw new NotFoundException('Part');
    return PartPresenter.toResponse(part);
  }
}
