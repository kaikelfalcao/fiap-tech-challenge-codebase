import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '../../../domain/user.entity';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/user.repository';
import type { Role } from '../../../domain/value-objects/role.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

import { TaxId } from '@/modules/customer/domain/tax-id.vo';
import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface RegisterUserInput {
  taxId: string;
  name: string;
  password: string;
  role: Role;
}

export interface RegisterUserOutput {
  id: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    let cleanTaxId: string;
    try {
      const taxId = TaxId.create(input.taxId);
      cleanTaxId = taxId.raw;
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    if (await this.users.existsByTaxId(cleanTaxId)) {
      throw new ConflictException('A user with this tax ID already exists');
    }

    if (input.password.length < 8) {
      throw new ValidationException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = User.create({
      id: UserId.generate(),
      taxId: cleanTaxId,
      name: input.name,
      passwordHash,
      role: input.role,
    });

    await this.users.save(user);
    return { id: user.id().value };
  }
}
