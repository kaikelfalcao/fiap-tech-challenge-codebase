import { ServiceOrderStatus } from './service-order-status.enum';
import { ServiceOrder } from './service-order.entity';

describe('ServiceOrder entity', () => {
  const customerId = 'customer-1';
  const vehicleId = 'vehicle-1';

  it('should create a service order with default values', () => {
    const order = ServiceOrder.create(customerId, vehicleId, 'order-1');

    expect(order).toBeInstanceOf(ServiceOrder);
    expect(order.id).toBe('order-1');
    expect(order.customerId).toBe(customerId);
    expect(order.vehicleId).toBe(vehicleId);
    expect(order.status).toBe(ServiceOrderStatus.Received);
    expect(order.totalCost).toBe(0);
    expect(order.parts).toHaveLength(0);
    expect(order.repairs).toHaveLength(0);
  });

  it('should generate an id when not provided', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    expect(order.id).toBeDefined();
  });

  it('should assign a part to service order', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.assignPart('part-1', 2, 50);

    expect(order.parts).toHaveLength(1);
    expect(order.parts[0].partId).toBe('part-1');
    expect(order.parts[0].quantity).toBe(2);
    expect(order.totalCost).toBe(2 * 50 * 100);
  });

  it('should increase quantity when assigning same part again', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.assignPart('part-1', 1, 50);
    order.assignPart('part-1', 2, 50);

    expect(order.parts).toHaveLength(1);
    expect(order.parts[0].quantity).toBe(3);
    expect(order.totalCost).toBe(3 * 50 * 100);
  });

  it('should assign a repair to service order', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.assignRepair('repair-1', 200);

    expect(order.repairs).toHaveLength(1);
    expect(order.repairs[0].repairId).toBe('repair-1');
    expect(order.totalCost).toBe(200 * 100);
  });

  it('should not duplicate repair assignment', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.assignRepair('repair-1', 200);
    order.assignRepair('repair-1', 300);

    expect(order.repairs).toHaveLength(1);
    expect(order.totalCost).toBe(200 * 100);
  });

  it('should recalculate total cost with parts and repairs', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.assignPart('part-1', 2, 50); // 100
    order.assignRepair('repair-1', 200); // 200

    expect(order.totalCost).toBe((100 + 200) * 100);
  });

  it('should change status following valid transitions', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.changeStatus(ServiceOrderStatus.InDiagnosis);
    order.changeStatus(ServiceOrderStatus.AwaitingApproval);
    order.changeStatus(ServiceOrderStatus.InProgress);

    expect(order.status).toBe(ServiceOrderStatus.InProgress);
  });

  it('should throw error on invalid status transition', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    expect(() => {
      order.changeStatus(ServiceOrderStatus.Finished);
    }).toThrow('Transição inválida');
  });

  it('should set finishedAt when status changes to Finished', () => {
    const order = ServiceOrder.create(customerId, vehicleId);

    order.changeStatus(ServiceOrderStatus.InDiagnosis);
    order.changeStatus(ServiceOrderStatus.AwaitingApproval);
    order.changeStatus(ServiceOrderStatus.InProgress);
    order.changeStatus(ServiceOrderStatus.Finished);

    expect(order.status).toBe(ServiceOrderStatus.Finished);
    expect(order.finishedAt).toBeInstanceOf(Date);
  });
});
