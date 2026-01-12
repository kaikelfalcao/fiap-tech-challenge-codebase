import { ServiceOrder } from 'src/domain/entities/service-order.entity';

export interface ServiceOrderRepository {
  save(order: ServiceOrder): Promise<void>;
  update(order: ServiceOrder): Promise<void>;
  findById(id: string): Promise<ServiceOrder | null>;
  findByCustomerAndVehicle(
    customerId: string,
    vehicleId: string,
  ): Promise<ServiceOrder>;
  findAll(): Promise<ServiceOrder[]>;
  delete(id: string): Promise<void>;
}
