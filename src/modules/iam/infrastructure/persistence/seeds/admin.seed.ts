import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User } from '@/modules/iam/domain/user.entity';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/iam/domain/user.repository';
import { UserId } from '@/modules/iam/domain/value-objects/user-id.vo';

@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeed.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const taxId = this.config.get<string>('ADMIN_TAX_ID') ?? '293.085.420-00';
    const password = this.config.get<string>('ADMIN_PASSWORD') ?? 'Admin@1234';

    const cleanTaxId = taxId.replace(/\D/g, '');

    const exists = await this.users.existsByTaxId(cleanTaxId);
    if (exists) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = User.create({
      id: UserId.generate(),
      taxId: cleanTaxId,
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    });

    await this.users.save(admin);
    this.logger.log('Admin user seeded successfully');
  }
}
