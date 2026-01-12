import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairController } from 'src/interface/http/repair.controller';
import { RepairOrm } from 'src/infra/typeorm/entities/repair.orm';
import { TypeOrmRepairRepository } from 'src/infra/typeorm/repositories/typeorm-repair.repository';
import { CreateRepairUseCase } from 'src/application/usecases/repair/create-repair.usecase';
import { FindAllRepairsUseCase } from 'src/application/usecases/repair/find-all-repairs.usecase';
import { FindRepairUseCase } from 'src/application/usecases/repair/find-repair.usecase';
import { UpdateRepairUseCase } from 'src/application/usecases/repair/update-repair.usecase';
import { DeleteRepairUseCase } from 'src/application/usecases/repair/delete-repair.usecase';
import { GetRepairsUseCase } from 'src/application/usecases/repair/get-repair.usecase';

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
  exports: [GetRepairsUseCase, 'RepairRepository'],
})
export class RepairModule {}
