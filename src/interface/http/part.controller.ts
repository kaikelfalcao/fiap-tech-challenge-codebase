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
} from '@nestjs/common';
import { CreatePartUseCase } from 'src/application/usecases/part/create-part.usecase';
import { UpdatePartUseCase } from 'src/application/usecases/part/update-part.usecase';
import { DeletePartUseCase } from 'src/application/usecases/part/delete-part.usecase';
import { FindPartUseCase } from 'src/application/usecases/part/find-part.usecase';
import { FindAllPartsUseCase } from 'src/application/usecases/part/find-all-parts.usecase';
import { PartPresenter } from '../presenters/part.presenter';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

@Controller('parts')
export class PartController {
  constructor(
    private createPart: CreatePartUseCase,
    private updatePart: UpdatePartUseCase,
    private deletePart: DeletePartUseCase,
    private findPart: FindPartUseCase,
    private findAllParts: FindAllPartsUseCase,
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
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.deletePart.execute({ id });
    return { message: 'Deleted successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const parts = await this.findAllParts.execute();
    return parts.map((part) => PartPresenter.toResponse(part));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string) {
    const part = await this.findPart.execute({ id });
    if (!part) throw new NotFoundException('Part');
    return PartPresenter.toResponse(part);
  }
}
