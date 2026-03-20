import { Inject, Injectable } from '@nestjs/common';

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/user.repository';
import type { Role } from '../../../domain/value-objects/role.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetMeOutput {
  id: string;
  taxId: string;
  name: string;
  role: Role;
  active: boolean;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(input: { userId: string }): Promise<GetMeOutput> {
    const user = await this.users.findById(UserId.fromString(input.userId));
    if (!user) {
      throw new NotFoundException('User', input.userId);
    }

    return {
      id: user.id().value,
      taxId: user.taxId,
      name: user.name,
      role: user.role,
      active: user.active,
    };
  }
}
