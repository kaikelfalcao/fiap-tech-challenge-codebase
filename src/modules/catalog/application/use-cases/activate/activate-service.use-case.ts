import { Inject, Injectable } from '@nestjs/common';

import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
} from '../../../domain/service.repository';
import { ServiceId } from '../../../domain/value-objects/service-id.vo';

import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';

export interface ActivateServiceInput {
  id: string;
}

@Injectable()
export class ActivateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: IServiceRepository,
  ) {}

  async execute(input: ActivateServiceInput): Promise<void> {
    const service = await this.services.findById(
      ServiceId.fromString(input.id),
    );
    if (!service) {
      throw new NotFoundException('Service', input.id);
    }
    service.activate();
    await this.services.update(service);
  }
}
