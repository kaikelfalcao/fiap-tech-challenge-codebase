import { Repair } from '../repair.entity';

describe('Repair entity', () => {
  it('should create a valid repair', () => {
    const repair = Repair.create('Engine diagnostics', 250, 'repair-id-1');

    expect(repair).toBeInstanceOf(Repair);
    expect(repair.id).toBe('repair-id-1');
    expect(repair.description).toBe('Engine diagnostics');
    expect(repair.cost).toBe(250);
  });

  it('should generate an id when not provided', () => {
    const repair = Repair.create('Oil change', 100);

    expect(repair.id).toBeDefined();
  });

  it('should change repair description', () => {
    const repair = Repair.create('Old description', 150);

    repair.changeDescription('New description');

    expect(repair.description).toBe('New description');
  });

  it('should change repair cost', () => {
    const repair = Repair.create('Brake service', 200);

    repair.changeCost(300);

    expect(repair.cost).toBe(300);
  });
});
