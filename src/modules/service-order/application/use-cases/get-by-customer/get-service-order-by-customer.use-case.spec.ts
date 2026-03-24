import {
  makeCustomerApiMock,
  makeCustomerView,
  type CustomerApiMock,
} from '../../helpers/external-apis.mock';
import {
  makeSORepositoryMock,
  type SORepositoryMock,
} from '../../helpers/service-order-repository.mock';
import {
  makeServiceOrder,
  SO_UUID_1,
  CUSTOMER_UUID,
} from '../../helpers/service-order.factory';

import { GetServiceOrderByCustomerUseCase } from './get-service-order-by-customer.use-case';

import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

describe('GetServiceOrderByCustomerUseCase', () => {
  let sut: GetServiceOrderByCustomerUseCase;
  let repo: SORepositoryMock;
  let customerApi: CustomerApiMock;

  beforeEach(() => {
    repo = makeSORepositoryMock();
    customerApi = makeCustomerApiMock();
    sut = new GetServiceOrderByCustomerUseCase(repo, customerApi);
  });

  it('should return the order if it belongs to the customer', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.findById.mockResolvedValue(makeServiceOrder());

    const output = await sut.execute({
      taxId: '52998224725',
      orderId: SO_UUID_1,
    });

    expect(output.id).toBe(SO_UUID_1);
    expect(output.customerId).toBe(CUSTOMER_UUID);
  });

  it('should return all order fields including statusLabel', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.findById.mockResolvedValue(
      makeServiceOrder({ status: 'IN_EXECUTION' }),
    );

    const output = await sut.execute({
      taxId: '52998224725',
      orderId: SO_UUID_1,
    });

    expect(output.status).toBe('IN_EXECUTION');
    expect(output.statusLabel).toBe('Em execução');
  });

  it('should throw NotFoundException if customer is not found', async () => {
    customerApi.getByTaxId.mockResolvedValue(null);

    await expect(
      sut.execute({ taxId: '52998224725', orderId: SO_UUID_1 }),
    ).rejects.toThrow(NotFoundException);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if order does not exist', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.findById.mockResolvedValue(null);

    await expect(
      sut.execute({ taxId: '52998224725', orderId: SO_UUID_1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BusinessRuleException if order belongs to another customer', async () => {
    customerApi.getByTaxId.mockResolvedValue(makeCustomerView());
    repo.findById.mockResolvedValue(
      makeServiceOrder({ customerId: 'other-customer-uuid' }),
    );

    await expect(
      sut.execute({ taxId: '52998224725', orderId: SO_UUID_1 }),
    ).rejects.toThrow(BusinessRuleException);
    await expect(
      sut.execute({ taxId: '52998224725', orderId: SO_UUID_1 }),
    ).rejects.toThrow('does not belong to the provided customer');
  });
});
