import { Vehicle } from '@domain/vehicle/vehicle.entity';
import { VehicleResponseDto } from './dtos/vehicle-response.dto';

export class VehiclePresenter {
  static toResponse(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate.value,
      customerId: vehicle.customerId,
      createdAt: vehicle.createdAt?.toISOString(),
      updatedAt: vehicle.updatedAt?.toISOString(),
    };
  }
}
