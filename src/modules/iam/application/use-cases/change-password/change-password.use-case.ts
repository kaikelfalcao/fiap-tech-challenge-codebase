import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/user.repository';
import { UserId } from '../../../domain/value-objects/user-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.users.findById(UserId.fromString(input.userId));
    if (!user) {
      throw new NotFoundException('User', input.userId);
    }

    const passwordMatch = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new ValidationException('Current password is incorrect');
    }

    if (input.newPassword.length < 8) {
      throw new ValidationException(
        'New password must be at least 8 characters',
      );
    }

    const newHash = await bcrypt.hash(input.newPassword, 10);
    user.changePassword(newHash);
    await this.users.update(user);
  }
}
