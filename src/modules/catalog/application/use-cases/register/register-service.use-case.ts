import { Inject, Injectable } from '@nestjs/common';

import { Service } from '../../../domain/service.entity';
import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
} from '../../../domain/service.repository';
import { Duration } from '../../../domain/value-objects/duration.vo';
import { ServiceCode } from '../../../domain/value-objects/service-code.vo';
import { ServiceId } from '../../../domain/value-objects/service-id.vo';

import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';
import { Money } from '@/shared/domain/value-objects/money.vo';

export interface RegisterServiceInput {
  code: string;
  name: string;
  description: string;
  basePriceCents: number;
  estimatedDurationMinutes: number;
}

export interface RegisterServiceOutput {
  id: string;
}

@Injectable()
export class RegisterServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async execute(input: RegisterServiceInput): Promise<RegisterServiceOutput> {
    let code: ServiceCode;
    try {
      code = ServiceCode.create(input.code);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    if (await this.services.existsByCode(code)) {
      throw new ConflictException(
        `A service with code ${code.value} already exists`,
      );
    }

    let basePrice: Money;
    try {
      basePrice = Money.fromCents(input.basePriceCents);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    let estimatedDuration: Duration;
    try {
      estimatedDuration = Duration.create(input.estimatedDurationMinutes);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    const service = Service.create({
      id: ServiceId.generate(),
      code,
      name: input.name,
      description: input.description,
      basePrice,
      estimatedDuration,
    });

    await this.services.save(service);
    return { id: service.id().value };
  }
}
