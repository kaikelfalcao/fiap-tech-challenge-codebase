import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import * as bcrypt from 'bcrypt';
import { RegisterUserUseCase } from './register-user.usecase';

jest.mock('bcrypt');

describe('RegisterUserUseCase', () => {
  let mockRepo: any;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      findByUsername: jest.fn(),
      save: jest.fn(),
    };

    useCase = new RegisterUserUseCase(mockRepo);
  });

  it('should register a new user', async () => {
    mockRepo.findByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    await useCase.execute('john', 'plain-password');

    expect(mockRepo.findByUsername).toHaveBeenCalledWith('john');
    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);

    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'john',
        passwordHash: 'hashed-password',
      }),
    );
  });

  it('should throw UserAlreadyExistsError when username is taken', async () => {
    mockRepo.findByUsername.mockResolvedValue({
      id: 'existing-id',
      username: 'john',
    });

    await expect(useCase.execute('john', 'password')).rejects.toThrow(
      UserAlreadyExistsError,
    );

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});
