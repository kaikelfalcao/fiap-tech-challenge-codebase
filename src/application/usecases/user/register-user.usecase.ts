import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from 'src/domain/entities/user.entity';
import type { UserRepository } from 'src/domain/repositories/user.repository';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepo: UserRepository,
  ) {}

  async execute(username: string, password: string): Promise<void> {
    const existingUser = await this.userRepo.findByUsername(username);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User(randomUUID(), username, passwordHash);

    await this.userRepo.save(user);
  }
}
