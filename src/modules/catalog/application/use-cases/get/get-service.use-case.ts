import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
} from '../../../domain/service.repository';
import { ServiceId } from '../../../domain/value-objects/service-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface GetServiceOutput {
  id: string;
  code: string;
  name: string;
  description: string;
  basePriceCents: number;
  basePriceFormatted: string;
  estimatedDurationMinutes: number;
  estimatedDurationFormatted: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: IServiceRepository,
  ) {}

  async execute(input: { id: string }): Promise<GetServiceOutput> {
    const service = await this.services.findById(
      ServiceId.fromString(input.id),
    );
    if (!service) {
      throw new NotFoundException('Service', input.id);
    }
    return {
      id: service.id().value,
      code: service.code.value,
      name: service.name,
      description: service.description,
      basePriceCents: service.basePrice.cents,
      basePriceFormatted: service.basePrice.formatted,
      estimatedDurationMinutes: service.estimatedDuration.minutes,
      estimatedDurationFormatted: service.estimatedDuration.formatted,
      active: service.active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
