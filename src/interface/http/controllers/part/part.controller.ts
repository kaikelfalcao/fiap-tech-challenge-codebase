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
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any) {
    const part = await this.createPart.execute(body);
    return PartPresenter.toResponse(part);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const part = await this.updatePart.execute({ ...body, id });
    return PartPresenter.toResponse(part);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.deletePart.execute({ id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string) {
    const part = await this.findPart.execute({ id });
    if (!part) throw new NotFoundException('Part');
    return PartPresenter.toResponse(part);
  }
}
