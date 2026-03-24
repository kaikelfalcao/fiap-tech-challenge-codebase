export class VehicleResponseDto {
  id: string;
  customerId: string;
  licensePlate: string;
  licensePlateType: 'old' | 'mercosul';
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedVehiclesResponseDto {
  data: VehicleResponseDto[];
  total: number;
  page: number;
  limit: number;
}
