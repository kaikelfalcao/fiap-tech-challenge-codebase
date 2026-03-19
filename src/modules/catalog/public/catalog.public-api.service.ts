// src/modules/catalog/public/catalog.public-api.service.ts
import { Inject, Injectable } from '@nestjs/common';

import type { Service } from '../domain/service.entity';
import {
  SERVICE_REPOSITORY,
  type IServiceRepository,
} from '../domain/service.repository';
import { ServiceCode } from '../domain/value-objects/service-code.vo';
import { ServiceId } from '../domain/value-objects/service-id.vo';

import type { ICatalogPublicApi, ServiceView } from './catalog.public-api';

@Injectable()
export class CatalogPublicApiService implements ICatalogPublicApi {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async getServiceById(id: string): Promise<ServiceView | null> {
    try {
      const service = await this.services.findById(ServiceId.fromString(id));
      return service ? this.toView(service) : null;
    } catch {
      return null;
    }
  }

  async getServiceByCode(code: string): Promise<ServiceView | null> {
    try {
      const serviceCode = ServiceCode.create(code);
      const service = await this.services.findByCode(serviceCode);
      return service ? this.toView(service) : null;
    } catch {
      return null;
    }
  }

  async listActiveServices(): Promise<ServiceView[]> {
    const result = await this.services.list({ active: true, limit: 1000 });
    return result.data.map(this.toView);
  }

  private toView(service: Service): ServiceView {
    return {
      id: service.id().value,
      code: service.code.value,
      name: service.name,
      description: service.description,
      basePriceCents: service.basePrice.cents,
      estimatedDurationMinutes: service.estimatedDuration.minutes,
      active: service.active,
    };
  }
}
