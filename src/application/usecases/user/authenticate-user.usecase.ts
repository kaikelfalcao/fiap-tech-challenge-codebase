import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRepository } from 'src/domain/repositories/user.repository';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(@Inject('UserRepository') private userRepo: UserRepository) {}

  async execute(username: string, password: string) {
    const user = await this.userRepo.findByUsername(username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
