import { mock } from 'jest-mock-extended';

import type { IServiceRepository } from '../../domain/service.repository';

export const makeServiceRepositoryMock = () => mock<IServiceRepository>();
export type ServiceRepositoryMock = ReturnType<
  typeof makeServiceRepositoryMock
>;
