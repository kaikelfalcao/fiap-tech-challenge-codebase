import { NotFoundError } from '@shared/errors/not-found.error';
import { DeleteCustomerUseCase } from './delete-customer.usecase';

describe('DeleteCustomerUseCase', () => {
  let mockRepo: any;
  let useCase: DeleteCustomerUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteCustomerUseCase(mockRepo);
  });

  it('should delete customer when customer exists', async () => {
    const customerId = 'customer-id';

    mockRepo.findById.mockResolvedValue({
      id: customerId,
    });

    await useCase.execute({ id: customerId });

    expect(mockRepo.findById).toHaveBeenCalledWith(customerId);
    expect(mockRepo.delete).toHaveBeenCalledWith(customerId);
  });

  it('should throw NotFoundError when customer does not exist', async () => {
    const customerId = 'customer-id';

    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: customerId })).rejects.toThrow(
      NotFoundError,
    );

    expect(mockRepo.findById).toHaveBeenCalledWith(customerId);
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
