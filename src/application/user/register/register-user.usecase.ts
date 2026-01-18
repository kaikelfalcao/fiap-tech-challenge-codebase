import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from 'src/domain/entities/user.entity';
import type { UserRepository } from 'src/domain/repositories/user.repository';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(username: string, password: string): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(username);

    if (existingUser) {
      throw new UserAlreadyExistsError(
        'User already exists',
        'REGISTER_CONFLICT',
        400,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User(randomUUID(), username, passwordHash);

    await this.userRepository.save(user);
  }
}
