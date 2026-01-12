import { Vehicle } from '../entities/vehicle.entity';

export interface VehicleRepository {
  save(vehicle: Vehicle): Promise<void>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findById(id: string): Promise<Vehicle | null>;
  findAll(): Promise<Vehicle[]>;
  delete(id: string): Promise<void>;
}
