import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivateItemUseCase } from './application/use-cases/item/activate/activate-item.use-case';
import { DeactivateItemUseCase } from './application/use-cases/item/deactivate/deactivate-item.use-case';
import { DeleteItemUseCase } from './application/use-cases/item/delete/delete-item.use-case';
import { GetItemUseCase } from './application/use-cases/item/get/get-item.use-case';
import { ListItemsUseCase } from './application/use-cases/item/list/list-items.use-case';
import { RegisterItemUseCase } from './application/use-cases/item/register/register-item.use-case';
import { UpdateItemUseCase } from './application/use-cases/item/update/update-item.use-case';
import { AddStockUseCase } from './application/use-cases/stock/add/add-stock.use-case';
import { AdjustStockUseCase } from './application/use-cases/stock/adjust/adjust-stock.use-case';
import { ConsumeStockUseCase } from './application/use-cases/stock/consume/consume-stock.use-case';
import { GetStockMovementsUseCase } from './application/use-cases/stock/get/get-stock-movements.use-case';
import { ReleaseStockUseCase } from './application/use-cases/stock/release/release-stock.use-case';
import { ReserveStockUseCase } from './application/use-cases/stock/reserve/reserve-stock.use-case';
import { ITEM_REPOSITORY } from './domain/item.repository';
import { STOCK_REPOSITORY } from './domain/stock.repository';
import { ItemOrmEntity } from './infrastructure/persistence/item.typeorm.entity';
import { ItemTypeOrmRepository } from './infrastructure/persistence/repositories/item.typeorm.repository';
import { StockTypeOrmRepository } from './infrastructure/persistence/repositories/stock.typeorm.repository';
import { StockMovementOrmEntity } from './infrastructure/persistence/stock-movement.typeorm.entity';
import { StockOrmEntity } from './infrastructure/persistence/stock.typeorm.entity';
import { InventoryController } from './presentation/http/inventory.controller';
import { INVENTORY_PUBLIC_API } from './public/inventory.public-api';
import { InventoryPublicApiService } from './public/inventory.public-api.service';

const ITEM_USE_CASES = [
  RegisterItemUseCase,
  UpdateItemUseCase,
  ActivateItemUseCase,
  DeactivateItemUseCase,
  DeleteItemUseCase,
  GetItemUseCase,
  ListItemsUseCase,
];

const STOCK_USE_CASES = [
  AddStockUseCase,
  ReserveStockUseCase,
  ReleaseStockUseCase,
  ConsumeStockUseCase,
  AdjustStockUseCase,
  GetStockMovementsUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemOrmEntity,
      StockOrmEntity,
      StockMovementOrmEntity,
    ]),
  ],
  controllers: [InventoryController],
  providers: [
    { provide: ITEM_REPOSITORY, useClass: ItemTypeOrmRepository },
    { provide: STOCK_REPOSITORY, useClass: StockTypeOrmRepository },
    ...ITEM_USE_CASES,
    ...STOCK_USE_CASES,
    { provide: INVENTORY_PUBLIC_API, useClass: InventoryPublicApiService },
  ],
  exports: [INVENTORY_PUBLIC_API],
})
export class InventoryModule {}
