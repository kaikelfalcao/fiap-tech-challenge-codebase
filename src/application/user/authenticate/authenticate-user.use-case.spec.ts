import { InvalidInputError } from '@shared/errors/invalid-input.error';
import * as bcrypt from 'bcrypt';
import { AuthenticateUserUseCase } from './authenticate-user.usecase';

jest.mock('bcrypt');

describe('AuthenticateUserUseCase', () => {
  let mockRepo: any;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findByUsername: jest.fn(),
    };

    useCase = new AuthenticateUserUseCase(mockRepo);
  });

  it('should authenticate user with valid credentials', async () => {
    const user = {
      id: 'user-id',
      username: 'john',
      passwordHash: 'hashed-password',
    };

    mockRepo.findByUsername.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('john', 'plain-password');

    expect(result).toBe(user);
    expect(mockRepo.findByUsername).toHaveBeenCalledWith('john');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
  });

  it('should throw InvalidInputError when user does not exist', async () => {
    mockRepo.findByUsername.mockResolvedValue(null);

    await expect(useCase.execute('john', 'password')).rejects.toThrow(
      InvalidInputError,
    );

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should throw InvalidInputError when password is invalid', async () => {
    const user = {
      id: 'user-id',
      username: 'john',
      passwordHash: 'hashed-password',
    };

    mockRepo.findByUsername.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute('john', 'wrong-password')).rejects.toThrow(
      InvalidInputError,
    );
  });
});
