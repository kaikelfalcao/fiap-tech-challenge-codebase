import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePartUseCase } from 'src/application/usecases/part/create-part.usecase';
import { DeletePartUseCase } from 'src/application/usecases/part/delete-part.usecase';
import { FindAllPartsUseCase } from 'src/application/usecases/part/find-all-parts.usecase';
import { FindPartUseCase } from 'src/application/usecases/part/find-part.usecase';
import { ReservePartsUseCase } from 'src/application/usecases/part/reserve-part.usecase';
import { ReturnPartsUseCase } from 'src/application/usecases/part/return-part.usecase';
import { UpdatePartUseCase } from 'src/application/usecases/part/update-part.usecase';
import { PartOrm } from 'src/infra/typeorm/entities/part.orm';
import { TypeOrmPartRepository } from 'src/infra/typeorm/repositories/typeorm-part.repository';
import { PartController } from 'src/interface/http/part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartOrm])],
  controllers: [PartController],
  providers: [
    { provide: 'PartRepository', useClass: TypeOrmPartRepository },
    CreatePartUseCase,
    FindAllPartsUseCase,
    FindPartUseCase,
    UpdatePartUseCase,
    DeletePartUseCase,
    ReservePartsUseCase,
    ReturnPartsUseCase,
  ],
  exports: [
    FindPartUseCase,
    ReservePartsUseCase,
    ReturnPartsUseCase,
    'PartRepository',
  ],
})
export class PartModule {}
