import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
  PaginatedResult,
} from '../../../domain/service.repository';
import type { GetServiceOutput } from '../get/get-service.use-case';

export interface ListServicesInput {
  active?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: IServiceRepository,
  ) {}

  async execute(
    input: ListServicesInput,
  ): Promise<PaginatedResult<GetServiceOutput>> {
    const result = await this.services.list(input);
    return {
      ...result,
      data: result.data.map((service) => ({
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
      })),
    };
  }
}
