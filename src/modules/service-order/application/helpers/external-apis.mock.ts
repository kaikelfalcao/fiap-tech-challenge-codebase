import { mock } from 'jest-mock-extended';

import {
  CUSTOMER_UUID,
  VEHICLE_UUID,
  SERVICE_UUID_1,
  ITEM_UUID_1,
} from './service-order.factory';

import type {
  ICatalogPublicApi,
  ServiceView,
} from '@/modules/catalog/public/catalog.public-api';
import type {
  ICustomerPublicApi,
  CustomerView,
} from '@/modules/customer/public/customer.public-api';
import type {
  IInventoryPublicApi,
  ItemStockView,
} from '@/modules/inventory/public/inventory.public-api';
import type {
  IVehiclePublicApi,
  VehicleView,
} from '@/modules/vehicle/public/vehicle.public-api';

export const makeCustomerApiMock = () => mock<ICustomerPublicApi>();
export const makeVehicleApiMock = () => mock<IVehiclePublicApi>();
export const makeCatalogApiMock = () => mock<ICatalogPublicApi>();
export const makeInventoryApiMock = () => mock<IInventoryPublicApi>();

export type CustomerApiMock = ReturnType<typeof makeCustomerApiMock>;
export type VehicleApiMock = ReturnType<typeof makeVehicleApiMock>;
export type CatalogApiMock = ReturnType<typeof makeCatalogApiMock>;
export type InventoryApiMock = ReturnType<typeof makeInventoryApiMock>;

export const makeCustomerView = (
  overrides: Partial<CustomerView> = {},
): CustomerView => ({
  id: CUSTOMER_UUID,
  taxId: '529.982.247-25',
  taxIdType: 'CPF',
  fullName: 'John Doe',
  phone: '(71) 99999-0000',
  email: 'john@doe.com',
  active: true,
  ...overrides,
});

export const makeVehicleView = (
  overrides: Partial<VehicleView> = {},
): VehicleView => ({
  id: VEHICLE_UUID,
  customerId: CUSTOMER_UUID,
  licensePlate: 'ABC-1234',
  licensePlateType: 'old',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  ...overrides,
});

export const makeCatalogServiceView = (
  overrides: Partial<ServiceView> = {},
): ServiceView => ({
  id: SERVICE_UUID_1,
  code: 'SVC-001',
  name: 'Troca de óleo',
  description: 'Troca de óleo e filtro',
  basePriceCents: 8000,
  estimatedDurationMinutes: 30,
  active: true,
  ...overrides,
});

export const makeInventoryItemView = (
  overrides: Partial<ItemStockView> = {},
): ItemStockView => ({
  id: ITEM_UUID_1,
  code: 'PART-001',
  name: 'Filtro de óleo',
  type: 'PART',
  unit: 'UN',
  unitPriceCents: 3500,
  stock: { quantity: 50, reserved: 5, available: 45 },
  ...overrides,
});
