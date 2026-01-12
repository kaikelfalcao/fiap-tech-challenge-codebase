import { Vehicle } from '../vehicle.entity';
import { Plate } from '../../value-objects/plate.vo';

describe('Vehicle entity', () => {
  const validPlate = 'ABC-1234';
  const customerId = 'customer-1';

  it('should create a valid vehicle', () => {
    const vehicle = Vehicle.create(
      'Toyota',
      'Corolla',
      2020,
      validPlate,
      customerId,
      'vehicle-id-1',
    );

    expect(vehicle).toBeInstanceOf(Vehicle);
    expect(vehicle.id).toBe('vehicle-id-1');
    expect(vehicle.brand).toBe('Toyota');
    expect(vehicle.model).toBe('Corolla');
    expect(vehicle.year).toBe(2020);
    expect(vehicle.plate).toBeInstanceOf(Plate);
    expect(vehicle.customerId).toBe(customerId);
  });

  it('should generate an id when not provided', () => {
    const vehicle = Vehicle.create(
      'Honda',
      'Civic',
      2021,
      validPlate,
      customerId,
    );

    expect(vehicle.id).toBeDefined();
  });

  it('should throw error when plate is invalid', () => {
    expect(() => {
      Vehicle.create('Ford', 'Fiesta', 2019, 'INVALID', customerId);
    }).toThrow();
  });

  it('should change vehicle brand', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    vehicle.changeBrand('Chevrolet');

    expect(vehicle.brand).toBe('Chevrolet');
  });

  it('should change vehicle model', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    vehicle.changeModel('Fusion');

    expect(vehicle.model).toBe('Fusion');
  });

  it('should change vehicle year', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    vehicle.changeYear(2022);

    expect(vehicle.year).toBe(2022);
  });

  it('should change vehicle plate', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    vehicle.changePlate('DEF-5678');

    expect(vehicle.plate).toBeInstanceOf(Plate);
    expect(vehicle.plate.value).toBe('DEF-5678');
  });

  it('should throw error when changing to invalid plate', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    expect(() => {
      vehicle.changePlate('INVALID');
    }).toThrow();
  });

  it('should change customer id', () => {
    const vehicle = Vehicle.create(
      'Ford',
      'Focus',
      2018,
      validPlate,
      customerId,
    );

    vehicle.changeCustomerId('customer-2');

    expect(vehicle.customerId).toBe('customer-2');
  });
});
