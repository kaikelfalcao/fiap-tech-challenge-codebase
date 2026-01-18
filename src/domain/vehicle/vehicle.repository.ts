import { Vehicle } from './vehicle.entity';

export interface VehicleRepository {
  save(vehicle: Vehicle): Promise<void>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findById(id: string): Promise<Vehicle | null>;
  findAll(options?: { skip?: number; take?: number }): Promise<Vehicle[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}
