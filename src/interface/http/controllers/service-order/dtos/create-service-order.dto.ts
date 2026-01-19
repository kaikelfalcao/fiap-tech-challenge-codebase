export interface CreateServiceOrderDto {
  customerRegistrationNumber: string;
  vehiclePlate: string;
  parts?: Array<{ partId: string; quantity: number }>;
  repairs?: Array<{ repairId: string }>;
}
