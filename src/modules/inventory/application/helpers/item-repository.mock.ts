import { mock } from 'jest-mock-extended';

import type { IItemRepository } from '../../domain/item.repository';

export const makeItemRepositoryMock = () => mock<IItemRepository>();
export type ItemRepositoryMock = ReturnType<typeof makeItemRepositoryMock>;
