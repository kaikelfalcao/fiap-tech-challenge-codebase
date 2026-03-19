import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ActivateItemUseCase } from '../../application/use-cases/item/activate/activate-item.use-case';
import { DeactivateItemUseCase } from '../../application/use-cases/item/deactivate/deactivate-item.use-case';
import { DeleteItemUseCase } from '../../application/use-cases/item/delete/delete-item.use-case';
import { GetItemUseCase } from '../../application/use-cases/item/get/get-item.use-case';
import { ListItemsUseCase } from '../../application/use-cases/item/list/list-items.use-case';
import { RegisterItemUseCase } from '../../application/use-cases/item/register/register-item.use-case';
import { UpdateItemUseCase } from '../../application/use-cases/item/update/update-item.use-case';
import { AddStockUseCase } from '../../application/use-cases/stock/add/add-stock.use-case';
import { AdjustStockUseCase } from '../../application/use-cases/stock/adjust/adjust-stock.use-case';
import { ConsumeStockUseCase } from '../../application/use-cases/stock/consume/consume-stock.use-case';
import { GetStockMovementsUseCase } from '../../application/use-cases/stock/get/get-stock-movements.use-case';
import { ReleaseStockUseCase } from '../../application/use-cases/stock/release/release-stock.use-case';
import { ReserveStockUseCase } from '../../application/use-cases/stock/reserve/reserve-stock.use-case';

import { AddStockDto } from './dtos/add-stock.dto';
import { AdjustStockDto } from './dtos/adjust-stock.dto';
import { ListItemsDto } from './dtos/list-items.dto';
import { RegisterItemDto } from './dtos/register-item.dto';
import { ReserveStockDto } from './dtos/reserve-stock.dto';
import { UpdateItemDto } from './dtos/update-item.dto';

@Controller('inventory/items')
export class InventoryController {
  constructor(
    private readonly registerItem: RegisterItemUseCase,
    private readonly updateItem: UpdateItemUseCase,
    private readonly activateItem: ActivateItemUseCase,
    private readonly deactivateItem: DeactivateItemUseCase,
    private readonly deleteItem: DeleteItemUseCase,
    private readonly getItem: GetItemUseCase,
    private readonly listItems: ListItemsUseCase,
    private readonly addStock: AddStockUseCase,
    private readonly reserveStock: ReserveStockUseCase,
    private readonly releaseStock: ReleaseStockUseCase,
    private readonly consumeStock: ConsumeStockUseCase,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly getMovements: GetStockMovementsUseCase,
  ) {}

  // --- Item CRUD ---
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterItemDto) {
    return this.registerItem.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ListItemsDto) {
    return this.listItems.execute(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string) {
    return this.getItem.execute({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.updateItem.execute({ id, ...dto });
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Param('id') id: string) {
    return this.activateItem.execute({ id });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string) {
    return this.deactivateItem.execute({ id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.deleteItem.execute({ id });
  }

  // --- Stock Operations ---
  @Post(':id/stock/add')
  @HttpCode(HttpStatus.NO_CONTENT)
  async add(@Param('id') itemId: string, @Body() dto: AddStockDto) {
    return this.addStock.execute({ itemId, ...dto });
  }

  @Post(':id/stock/reserve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reserve(@Param('id') itemId: string, @Body() dto: ReserveStockDto) {
    return this.reserveStock.execute({ itemId, ...dto });
  }

  @Post(':id/stock/release')
  @HttpCode(HttpStatus.NO_CONTENT)
  async release(@Param('id') itemId: string, @Body() dto: ReserveStockDto) {
    return this.releaseStock.execute({ itemId, ...dto });
  }

  @Post(':id/stock/consume')
  @HttpCode(HttpStatus.NO_CONTENT)
  async consume(@Param('id') itemId: string, @Body() dto: ReserveStockDto) {
    return this.consumeStock.execute({ itemId, ...dto });
  }

  @Post(':id/stock/adjust')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adjust(@Param('id') itemId: string, @Body() dto: AdjustStockDto) {
    return this.adjustStock.execute({ itemId, ...dto });
  }

  @Get(':id/stock/movements')
  @HttpCode(HttpStatus.OK)
  async movements(@Param('id') itemId: string) {
    return this.getMovements.execute({ itemId });
  }
}
