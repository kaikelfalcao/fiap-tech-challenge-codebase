import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairController } from '@interface/http/controllers/repair/repair.controller';
import { RepairOrm } from '@infrastructure/database/typeorm/entities/repair.orm';
import { TypeOrmRepairRepository } from '@infrastructure/database/typeorm/repositories/typeorm-repair.repository';
import {
  CalculateRepairCostsUseCase,
  CreateRepairUseCase,
  DeleteRepairUseCase,
  FindRepairUseCase,
  ListRepairUseCase,
  UpdateRepairUseCase,
} from '@application/repair';

@Module({
  imports: [TypeOrmModule.forFeature([RepairOrm])],
  controllers: [RepairController],
  providers: [
    { provide: 'RepairRepository', useClass: TypeOrmRepairRepository },
    CreateRepairUseCase,
    ListRepairUseCase,
    FindRepairUseCase,
    UpdateRepairUseCase,
    DeleteRepairUseCase,
    CalculateRepairCostsUseCase,
  ],
  exports: [CalculateRepairCostsUseCase, FindRepairUseCase, 'RepairRepository'],
})
export class RepairModule {}
