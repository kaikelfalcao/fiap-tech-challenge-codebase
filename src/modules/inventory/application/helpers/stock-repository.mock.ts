import { mock } from 'jest-mock-extended';

import type { IStockRepository } from '../../domain/stock.repository';

export const makeStockRepositoryMock = () => mock<IStockRepository>();
export type StockRepositoryMock = ReturnType<typeof makeStockRepositoryMock>;
