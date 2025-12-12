import { Document } from '../../../../src/domain/value-objects/document.vo';

describe('Document Value Object', () => {
  it('should throw for invalid CPF', () => {
    expect(() => new Document({ value: '123.456.789-00' })).toThrow(
      'Invalid document',
    );
  });

  it('should throw for invalid CNPJ', () => {
    expect(() => new Document({ value: '12.345.678/0001-00' })).toThrow(
      'Invalid document',
    );
  });

  it('should create a valid CPF', () => {
    const doc = new Document({ value: '36801082060' });
    expect(doc.value).toBe('36801082060');
  });

  it('should create a valid CNPJ', () => {
    const doc = new Document({ value: '12.345.678/0001-95' });
    expect(doc.value).toBe('12345678000195');
  });
});
