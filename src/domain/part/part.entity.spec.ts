import { Part } from './part.entity';

describe('Part entity', () => {
  it('should create a valid part with default quantity', () => {
    const part = Part.create(
      'Oil Filter',
      'SKU-123',
      50,
      undefined,
      'part-id-1',
    );

    expect(part).toBeInstanceOf(Part);
    expect(part.id).toBe('part-id-1');
    expect(part.name).toBe('Oil Filter');
    expect(part.sku).toBe('SKU-123');
    expect(part.price).toBe(50);
    expect(part.quantity).toBe(0);
  });

  it('should create a part with provided quantity', () => {
    const part = Part.create('Brake Pad', 'SKU-456', 120, 10);

    expect(part.quantity).toBe(10);
  });

  it('should generate an id when not provided', () => {
    const part = Part.create('Spark Plug', 'SKU-789', 30);

    expect(part.id).toBeDefined();
  });

  it('should change part name', () => {
    const part = Part.create('Old Name', 'SKU-1', 10);

    part.changeName('New Name');

    expect(part.name).toBe('New Name');
  });

  it('should change part price', () => {
    const part = Part.create('Part', 'SKU-1', 10);

    part.changePrice(25);

    expect(part.price).toBe(25);
  });

  it('should change part quantity', () => {
    const part = Part.create('Part', 'SKU-1', 10, 5);

    part.changeQuantity(20);

    expect(part.quantity).toBe(20);
  });

  it('should change part sku', () => {
    const part = Part.create('Part', 'SKU-OLD', 10);

    part.changeSku('SKU-NEW');

    expect(part.sku).toBe('SKU-NEW');
  });
});
