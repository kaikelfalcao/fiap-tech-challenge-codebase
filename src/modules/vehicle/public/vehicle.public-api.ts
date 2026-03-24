export interface VehicleView {
  id: string;
  customerId: string;
  licensePlate: string;
  licensePlateType: 'old' | 'mercosul';
  brand: string;
  model: string;
  year: number;
}

export interface IVehiclePublicApi {
  getById(id: string): Promise<VehicleView | null>;
  findByLicensePlate(licensePlate: string): Promise<VehicleView | null>;
  listByCustomer(customerId: string): Promise<VehicleView[]>;
}

export const VEHICLE_PUBLIC_API = Symbol('IVehiclePublicApi');
