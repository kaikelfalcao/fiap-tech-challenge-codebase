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
import { Repair } from '@domain/repair/repair.entity';
import { JwtAuthGuard } from '@infrastructure/auth/jwt.guard';

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
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: { description: string; cost: number },
  ): Promise<Repair> {
    return this.createRepair.execute(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: { description?: string; cost?: number },
  ): Promise<Repair> {
    return this.updateRepair.execute({ id, ...body });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteRepair.execute({ id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async find(@Param('id') id: string): Promise<Repair | null> {
    return this.findRepair.execute({ id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
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
      data: result.data,
      meta: result.meta,
    };
  }
}
