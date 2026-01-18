import { RegistrationNumber } from './registration-number.vo';

describe('RegistrationNumber', () => {
  it('should create a valid CPF and normalize digits', () => {
    const doc = RegistrationNumber.create('039.599.500-04');

    expect(doc.value).toBe('03959950004');
    expect(doc.formatted).toBe('039.599.500-04');
    expect(doc.isCPF()).toBe(true);
  });

  it('should create a valid CNPJ', () => {
    const doc = RegistrationNumber.create('45.723.174/0001-10');

    expect(doc.value).toBe('45723174000110');
    expect(doc.isCNPJ()).toBe(true);
  });

  it('should throw for invalid CPF', () => {
    expect(() => RegistrationNumber.create('111.111.111-11')).toThrow();
  });

  it('should throw for invalid length', () => {
    expect(() => RegistrationNumber.create('123')).toThrow();
  });
});
