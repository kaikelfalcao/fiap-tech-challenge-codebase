import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/user.repository';
import type { JwtPayload } from '../../../infrastructure/jwt/jwt.payload';

import { TaxId } from '@/modules/customer/domain/tax-id.vo';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface LoginInput {
  taxId: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  userId: string;
  name: string;
  role: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    let cleanTaxId: string;
    try {
      const taxId = TaxId.create(input.taxId);
      cleanTaxId = taxId.raw;
    } catch {
      // Não revelar se é CPF/CNPJ inválido ou usuário inexistente
      throw new ValidationException('Invalid credentials');
    }

    const user = await this.users.findByTaxId(cleanTaxId);

    // Timing-safe: sempre executa o hash mesmo quando user não existe
    const dummyHash =
      '$2b$10$dummyhashtopreventtimingattacks000000000000000000000000';
    const passwordMatch = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? dummyHash,
    );

    if (!user || !passwordMatch) {
      throw new ValidationException('Invalid credentials');
    }

    user.ensureIsActive();

    const payload: JwtPayload = {
      sub: user.id().value,
      taxId: user.taxId,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload);

    return {
      accessToken,
      userId: user.id().value,
      name: user.name,
      role: user.role,
    };
  }
}
