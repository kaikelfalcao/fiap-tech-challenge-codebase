import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
} from '../../../domain/service.repository';
import { Duration } from '../../../domain/value-objects/duration.vo';
import { ServiceId } from '../../../domain/value-objects/service-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';
import { Money } from '@/shared/domain/value-objects/money.vo';

export interface UpdateServiceInput {
  id: string;
  name?: string;
  description?: string;
  basePriceCents?: number;
  estimatedDurationMinutes?: number;
}

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async execute(input: UpdateServiceInput): Promise<void> {
    const service = await this.services.findById(
      ServiceId.fromString(input.id),
    );
    if (!service) {
      throw new NotFoundException('Service', input.id);
    }

    let basePrice: Money | undefined;
    if (input.basePriceCents !== undefined) {
      try {
        basePrice = Money.fromCents(input.basePriceCents);
      } catch (e) {
        throw new ValidationException((e as Error).message);
      }
    }

    let estimatedDuration: Duration | undefined;
    if (input.estimatedDurationMinutes !== undefined) {
      try {
        estimatedDuration = Duration.create(input.estimatedDurationMinutes);
      } catch (e) {
        throw new ValidationException((e as Error).message);
      }
    }

    service.changeAttributes({
      name: input.name,
      description: input.description,
      basePrice,
      estimatedDuration,
    });

    await this.services.update(service);
  }
}
