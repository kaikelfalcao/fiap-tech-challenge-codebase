import { mock } from 'jest-mock-extended';

import { VALID_CUSTOMER_ID } from './vehicle.factory';

import type {
  ICustomerPublicApi,
  CustomerView,
} from '@/modules/customer/public/customer.public-api';

export const makeCustomerApiMock = () => mock<ICustomerPublicApi>();
export type CustomerApiMock = ReturnType<typeof makeCustomerApiMock>;

export const makeCustomerView = (
  overrides: Partial<CustomerView> = {},
): CustomerView => ({
  id: VALID_CUSTOMER_ID,
  taxId: '529.982.247-25',
  taxIdType: 'CPF',
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: 'john@doe.com',
  active: true,
  ...overrides,
});
