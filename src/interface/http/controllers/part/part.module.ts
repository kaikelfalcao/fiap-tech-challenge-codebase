import { PartOrm } from '@infrastructure/database/typeorm/entities/part.orm';
import { TypeOrmPartRepository } from '@infrastructure/database/typeorm/repositories/typeorm-part.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePartUseCase } from '@application/part/create/create-part.usecase';
import { DeletePartUseCase } from '@application/part/delete/delete-part.usecase';
import { ListPartUseCase } from '@application/part/list/list-part.usecase';
import { FindPartUseCase } from '@application/part/find/find-part.usecase';
import { ReservePartUseCase } from '@application/part/reserve/reserve-part.usecase';
import { ReturnPartUseCase } from '@application/part/return/return-part.usecase';
import { UpdatePartUseCase } from '@application/part/update/update-part.usecase';
import { PartController } from '@interface/http/controllers/part/part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartOrm])],
  controllers: [PartController],
  providers: [
    { provide: 'PartRepository', useClass: TypeOrmPartRepository },
    CreatePartUseCase,
    ListPartUseCase,
    FindPartUseCase,
    UpdatePartUseCase,
    DeletePartUseCase,
    ReservePartUseCase,
    ReturnPartUseCase,
  ],
  exports: [
    FindPartUseCase,
    ReservePartUseCase,
    ReturnPartUseCase,
    'PartRepository',
  ],
})
export class PartModule {}
