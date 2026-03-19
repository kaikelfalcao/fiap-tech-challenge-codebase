import { ValueObject } from '@/shared/domain/value-object';

export class TaxId extends ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  // ========= FACTORY =========

  static create(input: string): TaxId {
    if (!input || typeof input !== 'string') {
      throw new Error('TaxId input must be a non-empty string');
    }

    const clean = this.clean(input);

    if (this.isCPF(clean)) {
      if (!this.validateCPF(clean)) {
        throw new Error('Invalid CPF');
      }
      return new TaxId(clean);
    }

    if (this.isCNPJ(clean)) {
      if (!this.validateCNPJ(clean)) {
        throw new Error('Invalid CNPJ');
      }
      return new TaxId(clean);
    }

    throw new Error(
      'Invalid TaxId: must be a CPF (11 digits) or CNPJ (14 digits)',
    );
  }

  // ========= GETTERS =========

  get raw(): string {
    return this.value;
  }

  get formatted(): string {
    return TaxId.isCPF(this.value)
      ? TaxId.formatCPF(this.value)
      : TaxId.formatCNPJ(this.value);
  }

  get type(): 'CPF' | 'CNPJ' {
    return TaxId.isCPF(this.value) ? 'CPF' : 'CNPJ';
  }

  // ========= UTILS =========

  private static clean(value: string): string {
    return value.replace(/\D/g, '');
  }

  private static isCPF(value: string): boolean {
    return value.length === 11;
  }

  private static isCNPJ(value: string): boolean {
    return value.length === 14;
  }

  // ========= CPF =========

  private static validateCPF(cpf: string): boolean {
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }

    const calcCheck = (base: string, factor: number): number => {
      let total = 0;
      for (let i = 0; i < base.length; i++) {
        total += Number(base[i]) * factor--;
      }
      const rest = total % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    const digit1 = calcCheck(cpf.slice(0, 9), 10);
    const digit2 = calcCheck(cpf.slice(0, 10), 11);
    return cpf.endsWith(`${digit1}${digit2}`);
  }

  private static formatCPF(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  // ========= CNPJ =========

  private static validateCNPJ(cnpj: string): boolean {
    if (/^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    const calcCheck = (base: string, weights: number[]): number => {
      const sum = base
        .split('')
        .reduce((acc, num, i) => acc + Number(num) * weights[i], 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, ...weights1];
    const digit1 = calcCheck(cnpj.slice(0, 12), weights1);
    const digit2 = calcCheck(cnpj.slice(0, 13), weights2);
    return cnpj.endsWith(`${digit1}${digit2}`);
  }

  private static formatCNPJ(cnpj: string): string {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );
  }

  // ========= EQUALITY =========

  equals(other: TaxId): boolean {
    return this.value === other.value;
  }
}
