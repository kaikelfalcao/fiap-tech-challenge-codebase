import { Inject, Injectable } from '@nestjs/common';

import { LicensePlate } from '../domain/value-objects/license-plate.vo';
import { VehicleId } from '../domain/value-objects/vehicle-id.vo';
import type { Vehicle } from '../domain/vehicle.entity';
import {
  VEHICLE_REPOSITORY,
  type IVehicleRepository,
} from '../domain/vehicle.repository';

import type { IVehiclePublicApi, VehicleView } from './vehicle.public-api';

@Injectable()
export class VehiclePublicApiService implements IVehiclePublicApi {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
  ) {}

  async getById(id: string): Promise<VehicleView | null> {
    let vehicleId: VehicleId;
    try {
      vehicleId = VehicleId.fromString(id);
    } catch {
      return null;
    }

    const vehicle = await this.vehicles.findById(vehicleId);
    return vehicle ? this.toView(vehicle) : null;
  }

  async findByLicensePlate(licensePlate: string): Promise<VehicleView | null> {
    let plate: LicensePlate;
    try {
      plate = LicensePlate.create(licensePlate);
    } catch {
      return null;
    }

    const vehicle = await this.vehicles.findByLicensePlate(plate);
    return vehicle ? this.toView(vehicle) : null;
  }

  async listByCustomer(customerId: string): Promise<VehicleView[]> {
    const result = await this.vehicles.list({ customerId, limit: 1000 });
    return result.data.map(this.toView);
  }

  private toView(vehicle: Vehicle): VehicleView {
    return {
      id: vehicle.id().value,
      customerId: vehicle.customerId,
      licensePlate: vehicle.licensePlate.formatted,
      licensePlateType: vehicle.licensePlate.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    };
  }
}
