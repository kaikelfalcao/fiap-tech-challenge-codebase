import { TaxId } from './tax-id.vo';

// Real valid documents generated for testing purposes only
const VALID_CPF_RAW = '52998224725';
const VALID_CPF_FORMATTED = '529.982.247-25';
const VALID_CPF_DIRTY = '529.982.247-25'; // same, masked input

const VALID_CPF_2_RAW = '71428793860';

const VALID_CNPJ_RAW = '11222333000181';
const VALID_CNPJ_FORMATTED = '11.222.333/0001-81';
const VALID_CNPJ_DIRTY = '11.222.333/0001-81'; // same, masked input

const VALID_CNPJ_2_RAW = '45997418000153';

describe('TaxId', () => {
  // -------------------------------------------------------------------------
  describe('create() — CPF', () => {
    it('should create a TaxId from a raw valid CPF', () => {
      const taxId = TaxId.create(VALID_CPF_RAW);
      expect(taxId).toBeInstanceOf(TaxId);
    });

    it('should create a TaxId from a formatted (masked) CPF', () => {
      const taxId = TaxId.create(VALID_CPF_DIRTY);
      expect(taxId.raw).toBe(VALID_CPF_RAW);
    });

    it('should strip non-digit characters from CPF input', () => {
      const taxId = TaxId.create('529.982.247-25');
      expect(taxId.raw).toBe(VALID_CPF_RAW);
    });

    it('should throw when CPF has all repeated digits', () => {
      const repeatedDigitCPFs = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
      ];

      for (const cpf of repeatedDigitCPFs) {
        expect(() => TaxId.create(cpf)).toThrow('Invalid CPF');
      }
    });

    it('should throw when CPF check digits are incorrect', () => {
      expect(() => TaxId.create('52998224700')).toThrow('Invalid CPF');
    });

    it('should throw when CPF has correct length but wrong digits', () => {
      expect(() => TaxId.create('12345678900')).toThrow('Invalid CPF');
    });
  });

  // -------------------------------------------------------------------------
  describe('create() — CNPJ', () => {
    it('should create a TaxId from a raw valid CNPJ', () => {
      const taxId = TaxId.create(VALID_CNPJ_RAW);
      expect(taxId).toBeInstanceOf(TaxId);
    });

    it('should create a TaxId from a formatted (masked) CNPJ', () => {
      const taxId = TaxId.create(VALID_CNPJ_DIRTY);
      expect(taxId.raw).toBe(VALID_CNPJ_RAW);
    });

    it('should strip non-digit characters from CNPJ input', () => {
      const taxId = TaxId.create('11.222.333/0001-81');
      expect(taxId.raw).toBe(VALID_CNPJ_RAW);
    });

    it('should throw when CNPJ has all repeated digits', () => {
      const repeatedDigitCNPJs = [
        '00000000000000',
        '11111111111111',
        '22222222222222',
      ];

      for (const cnpj of repeatedDigitCNPJs) {
        expect(() => TaxId.create(cnpj)).toThrow('Invalid CNPJ');
      }
    });

    it('should throw when CNPJ check digits are incorrect', () => {
      expect(() => TaxId.create('11222333000100')).toThrow('Invalid CNPJ');
    });

    it('should throw when CNPJ has correct length but wrong digits', () => {
      expect(() => TaxId.create('12345678000100')).toThrow('Invalid CNPJ');
    });
  });

  // -------------------------------------------------------------------------
  describe('create() — invalid inputs', () => {
    it('should throw when input has neither 11 nor 14 digits', () => {
      expect(() => TaxId.create('123')).toThrow('Invalid TaxId');
      expect(() => TaxId.create('1234567890')).toThrow('Invalid TaxId'); // 10 digits
      expect(() => TaxId.create('123456789012')).toThrow('Invalid TaxId'); // 12 digits
    });

    it('should throw when input is an empty string', () => {
      expect(() => TaxId.create('')).toThrow();
    });

    it('should throw when input is only special characters', () => {
      expect(() => TaxId.create('...-/')).toThrow();
    });

    it('should throw when input has letters mixed with digits resulting in wrong length', () => {
      expect(() => TaxId.create('abc.def.ghi-jk')).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe('raw', () => {
    it('should return the CPF without formatting', () => {
      const taxId = TaxId.create(VALID_CPF_FORMATTED);
      expect(taxId.raw).toBe(VALID_CPF_RAW);
    });

    it('should return the CNPJ without formatting', () => {
      const taxId = TaxId.create(VALID_CNPJ_FORMATTED);
      expect(taxId.raw).toBe(VALID_CNPJ_RAW);
    });

    it('should return the same value regardless of input format', () => {
      const fromRaw = TaxId.create(VALID_CPF_RAW);
      const fromFormatted = TaxId.create(VALID_CPF_FORMATTED);
      expect(fromRaw.raw).toBe(fromFormatted.raw);
    });
  });

  // -------------------------------------------------------------------------
  describe('formatted', () => {
    it('should format a CPF as ###.###.###-##', () => {
      const taxId = TaxId.create(VALID_CPF_RAW);
      expect(taxId.formatted).toBe(VALID_CPF_FORMATTED);
    });

    it('should format a CNPJ as ##.###.###/####-##', () => {
      const taxId = TaxId.create(VALID_CNPJ_RAW);
      expect(taxId.formatted).toBe(VALID_CNPJ_FORMATTED);
    });

    it('should produce the same formatted output regardless of input format', () => {
      const fromRaw = TaxId.create(VALID_CPF_RAW);
      const fromFormatted = TaxId.create(VALID_CPF_FORMATTED);
      expect(fromRaw.formatted).toBe(fromFormatted.formatted);
    });
  });

  // -------------------------------------------------------------------------
  describe('type', () => {
    it('should return "CPF" for an 11-digit document', () => {
      const taxId = TaxId.create(VALID_CPF_RAW);
      expect(taxId.type).toBe('CPF');
    });

    it('should return "CNPJ" for a 14-digit document', () => {
      const taxId = TaxId.create(VALID_CNPJ_RAW);
      expect(taxId.type).toBe('CNPJ');
    });
  });

  // -------------------------------------------------------------------------
  describe('equals()', () => {
    it('should return true for two TaxIds with the same CPF', () => {
      const a = TaxId.create(VALID_CPF_RAW);
      const b = TaxId.create(VALID_CPF_FORMATTED);
      expect(a.equals(b)).toBe(true);
    });

    it('should return true for two TaxIds with the same CNPJ', () => {
      const a = TaxId.create(VALID_CNPJ_RAW);
      const b = TaxId.create(VALID_CNPJ_FORMATTED);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two different CPFs', () => {
      const a = TaxId.create(VALID_CPF_RAW);
      const b = TaxId.create(VALID_CPF_2_RAW);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for two different CNPJs', () => {
      const a = TaxId.create(VALID_CNPJ_RAW);
      const b = TaxId.create(VALID_CNPJ_2_RAW);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when comparing a CPF against a CNPJ', () => {
      const cpf = TaxId.create(VALID_CPF_RAW);
      const cnpj = TaxId.create(VALID_CNPJ_RAW);
      expect(cpf.equals(cnpj)).toBe(false);
    });

    it('should be reflexive — a TaxId equals itself', () => {
      const taxId = TaxId.create(VALID_CPF_RAW);
      expect(taxId.equals(taxId)).toBe(true);
    });

    it('should be symmetric — if a equals b then b equals a', () => {
      const a = TaxId.create(VALID_CNPJ_RAW);
      const b = TaxId.create(VALID_CNPJ_FORMATTED);
      expect(a.equals(b)).toBe(true);
      expect(b.equals(a)).toBe(true);
    });
  });
});
