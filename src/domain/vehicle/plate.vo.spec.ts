import { Plate } from './plate.vo';

describe('Plate Value Object', () => {
  it('should create a plate with old pattern', () => {
    const plate = Plate.create('ABC1234');

    expect(plate).toBeInstanceOf(Plate);
    expect(plate.value).toBe('ABC1234');
  });

  it('should create a plate with Mercosul pattern', () => {
    const plate = Plate.create('ABC-1D23');

    expect(plate).toBeInstanceOf(Plate);
    expect(plate.value).toBe('ABC-1D23');
  });

  it('should throw error when plate is empty', () => {
    expect(() => {
      Plate.create('');
    }).toThrow('Invalid Plate');
  });

  it('should throw error when plate is null or undefined', () => {
    expect(() => {
      Plate.create(undefined as any);
    }).toThrow('Invalid Plate');
  });

  it('should throw error when plate format is invalid', () => {
    const invalidPlates = [
      'AB12345',
      'ABC12D4',
      '1234ABC',
      'abcd1234',
      'AAA-123',
      'A1B2C3D',
    ];

    for (const plate of invalidPlates) {
      expect(() => {
        Plate.create(plate);
      }).toThrow('Invalid Plate');
    }
  });
});
