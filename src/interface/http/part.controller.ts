import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { CreatePartUseCase } from 'src/application/usecases/part/create-part.usecase';
import { UpdatePartUseCase } from 'src/application/usecases/part/update-part.usecase';
import { DeletePartUseCase } from 'src/application/usecases/part/delete-part.usecase';
import { FindPartUseCase } from 'src/application/usecases/part/find-part.usecase';
import { FindAllPartsUseCase } from 'src/application/usecases/part/find-all-parts.usecase';
import { PartPresenter } from '../presenters/part.presenter';

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
  async create(@Body() body: any) {
    const part = await this.createPart.execute(body);
    return PartPresenter.toResponse(part);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const part = await this.updatePart.execute({ ...body, id });
    return PartPresenter.toResponse(part);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deletePart.execute({ id });
    return { message: 'Deleted successfully' };
  }

  @Get()
  async findAll() {
    const parts = await this.findAllParts.execute();
    return parts.map((part) => PartPresenter.toResponse(part));
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    const part = await this.findPart.execute({ id });
    if (!part) throw new NotFoundException('Part');
    return PartPresenter.toResponse(part);
  }
}
