import { Inject, Injectable } from '@nestjs/common';
import { InvalidInputError } from '@shared/errors/invalid-input.error';
import * as bcrypt from 'bcrypt';
import type { UserRepository } from '@domain/user/user.repository';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(@Inject('UserRepository') private userRepo: UserRepository) {}

  async execute(username: string, password: string) {
    const user = await this.userRepo.findByUsername(username);

    if (!user) {
      throw new InvalidInputError('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      throw new InvalidInputError('Invalid credentials');
    }

    return user;
  }
}
