import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartRepository } from 'src/application/ports/part.repository';
import { CreatePartUseCase } from 'src/application/usecases/create-part.usecase';
import { DeletePartUseCase } from 'src/application/usecases/delete-part.usecase';
import { FindAllPartsUseCase } from 'src/application/usecases/find-all-parts.usecase';
import { FindPartUseCase } from 'src/application/usecases/find-part.usecase';
import { UpdatePartUseCase } from 'src/application/usecases/update-part.usecase';
import { PartOrm } from 'src/infra/typeorm/entities/part.orm';
import { TypeOrmPartRepository } from 'src/infra/typeorm/repositories/typeorm-part.repository';
import { PartController } from 'src/interface/http/part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartOrm])],
  controllers: [PartController],
  providers: [
    {
      provide: 'PartRepository',
      useClass: TypeOrmPartRepository,
    },
    {
      provide: CreatePartUseCase,
      useFactory: (repo: PartRepository) => new CreatePartUseCase(repo),
      inject: ['PartRepository'],
    },
    {
      provide: FindAllPartsUseCase,
      useFactory: (repo: PartRepository) => new FindAllPartsUseCase(repo),
      inject: ['PartRepository'],
    },
    {
      provide: FindPartUseCase,
      useFactory: (repo: PartRepository) => new FindPartUseCase(repo),
      inject: ['PartRepository'],
    },
    {
      provide: UpdatePartUseCase,
      useFactory: (repo: PartRepository) => new UpdatePartUseCase(repo),
      inject: ['PartRepository'],
    },
    {
      provide: DeletePartUseCase,
      useFactory: (repo: PartRepository) => new DeletePartUseCase(repo),
      inject: ['PartRepository'],
    },
  ],
})
export class PartModule {}
