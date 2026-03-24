// src/modules/vehicle/application/use-cases/register/register-vehicle.use-case.ts

import { Inject, Injectable } from '@nestjs/common';

import { LicensePlate } from '../../../domain/value-objects/license-plate.vo';
import { VehicleId } from '../../../domain/value-objects/vehicle-id.vo';
import { Vehicle } from '../../../domain/vehicle.entity';
import {
  type IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../../../domain/vehicle.repository';

import {
  CUSTOMER_PUBLIC_API,
  type ICustomerPublicApi,
} from '@/modules/customer/public/customer.public-api';
import { ConflictException } from '@/shared/domain/exceptions/conflict.exception';
import { NotFoundException } from '@/shared/domain/exceptions/not-found.exception';
import { ValidationException } from '@/shared/domain/exceptions/validation.exception';

export interface RegisterVehicleInput {
  customerId: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}

export interface RegisterVehicleOutput {
  id: string;
}

@Injectable()
export class RegisterVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicles: IVehicleRepository,
    @Inject(CUSTOMER_PUBLIC_API)
    private readonly customerApi: ICustomerPublicApi,
  ) {}

  async execute(input: RegisterVehicleInput): Promise<RegisterVehicleOutput> {
    const customer = await this.customerApi.getById(input.customerId);
    if (!customer) {
      throw new NotFoundException('Customer', input.customerId);
    }
    if (!customer.active) {
      throw new ValidationException(
        'Cannot register a vehicle for an inactive customer',
      );
    }

    let licensePlate: LicensePlate;
    try {
      licensePlate = LicensePlate.create(input.licensePlate);
    } catch (e) {
      throw new ValidationException((e as Error).message);
    }

    const alreadyExists =
      await this.vehicles.existsByLicensePlate(licensePlate);
    if (alreadyExists) {
      throw new ConflictException(
        'A vehicle with this license plate already exists',
      );
    }

    const vehicle = Vehicle.create({
      id: VehicleId.generate(),
      customerId: input.customerId,
      licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
    });

    await this.vehicles.save(vehicle);
    return { id: vehicle.id().value };
  }
}
