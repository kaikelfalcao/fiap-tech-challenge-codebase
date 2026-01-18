import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateRepairUseCase } from 'src/application/usecases/repair/create-repair.usecase';
import { DeleteRepairUseCase } from 'src/application/usecases/repair/delete-repair.usecase';
import { FindAllRepairsUseCase } from 'src/application/usecases/repair/find-all-repairs.usecase';
import { FindRepairUseCase } from 'src/application/usecases/repair/find-repair.usecase';
import { UpdateRepairUseCase } from 'src/application/usecases/repair/update-repair.usecase';
import { Repair } from 'src/domain/entities/repair.entity';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

@Controller('repairs')
export class RepairController {
  constructor(
    private readonly createUseCase: CreateRepairUseCase,
    private readonly updateUseCase: UpdateRepairUseCase,
    private readonly deleteUseCase: DeleteRepairUseCase,
    private readonly findUseCase: FindRepairUseCase,
    private readonly findAllUseCase: FindAllRepairsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { description: string; cost: number },
  ): Promise<Repair> {
    return this.createUseCase.execute(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: { description?: string; cost?: number },
  ): Promise<Repair> {
    return this.updateUseCase.execute({ id, ...body });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute({ id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string): Promise<Repair | null> {
    return this.findUseCase.execute({ id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Repair[]> {
    return this.findAllUseCase.execute();
  }
}
