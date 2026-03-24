import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivateServiceUseCase } from './application/use-cases/activate/activate-service.use-case';
import { DeactivateServiceUseCase } from './application/use-cases/deactivate/deactivate-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete/delete-service.use-case';
import { GetServiceUseCase } from './application/use-cases/get/get-service.use-case';
import { ListServicesUseCase } from './application/use-cases/list/list-services.use-case';
import { RegisterServiceUseCase } from './application/use-cases/register/register-service.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update/update-service.use-case';
import { SERVICE_REPOSITORY } from './domain/service.repository';
import { ServiceOrmEntity } from './infrastructure/persistence/service.typeorm.entity';
import { ServiceTypeOrmRepository } from './infrastructure/persistence/service.typeorm.repository';
import { CatalogController } from './presentation/http/catalog.controller';
import { CATALOG_PUBLIC_API } from './public/catalog.public-api';
import { CatalogPublicApiService } from './public/catalog.public-api.service';

const USE_CASES = [
  RegisterServiceUseCase,
  UpdateServiceUseCase,
  ActivateServiceUseCase,
  DeactivateServiceUseCase,
  DeleteServiceUseCase,
  GetServiceUseCase,
  ListServicesUseCase,
];

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrmEntity])],
  controllers: [CatalogController],
  providers: [
    { provide: SERVICE_REPOSITORY, useClass: ServiceTypeOrmRepository },
    ...USE_CASES,
    { provide: CATALOG_PUBLIC_API, useClass: CatalogPublicApiService },
  ],
  exports: [CATALOG_PUBLIC_API],
})
export class CatalogModule {}
