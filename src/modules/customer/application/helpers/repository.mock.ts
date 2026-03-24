import { mock } from 'jest-mock-extended';

import type { ICustomerRepository } from '../../domain/customer.repository';

export const makeRepositoryMock = () => mock<ICustomerRepository>();
export type CustomerRepositoryMock = ReturnType<typeof makeRepositoryMock>;
