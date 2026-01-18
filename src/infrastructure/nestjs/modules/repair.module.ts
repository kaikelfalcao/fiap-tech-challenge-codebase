import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairController } from 'src/interface/http/repair.controller';
import { CreateRepairUseCase } from 'src/application/usecases/repair/create-repair.usecase';
import { FindAllRepairsUseCase } from 'src/application/usecases/repair/find-all-repairs.usecase';
import { FindRepairUseCase } from 'src/application/usecases/repair/find-repair.usecase';
import { UpdateRepairUseCase } from 'src/application/usecases/repair/update-repair.usecase';
import { DeleteRepairUseCase } from 'src/application/usecases/repair/delete-repair.usecase';
import { GetRepairsUseCase } from 'src/application/usecases/repair/get-repair.usecase';
import { RepairOrm } from '@infrastructure/database/typeorm/entities/repair.orm';
import { TypeOrmRepairRepository } from '@infrastructure/database/typeorm/repositories/typeorm-repair.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RepairOrm])],
  controllers: [RepairController],
  providers: [
    { provide: 'RepairRepository', useClass: TypeOrmRepairRepository },
    CreateRepairUseCase,
    FindAllRepairsUseCase,
    FindRepairUseCase,
    UpdateRepairUseCase,
    DeleteRepairUseCase,
    GetRepairsUseCase,
  ],
  exports: [GetRepairsUseCase, FindRepairUseCase, 'RepairRepository'],
})
export class RepairModule {}
