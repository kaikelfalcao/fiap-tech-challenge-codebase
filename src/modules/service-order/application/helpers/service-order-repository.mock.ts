import { mock } from 'jest-mock-extended';

import type { IServiceOrderRepository } from '../../domain/service-order.repository';

export const makeSORepositoryMock = () => mock<IServiceOrderRepository>();
export type SORepositoryMock = ReturnType<typeof makeSORepositoryMock>;
