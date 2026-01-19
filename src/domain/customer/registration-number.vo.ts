import { InvalidRegistrationNumber } from './errors/invalid-registration-number.error';

export class RegistrationNumber {
  private constructor(
    private readonly digits: string,
    private readonly type: 'CPF' | 'CNPJ',
  ) {}

  static create(input: string): RegistrationNumber {
    const digits = input.replace(/\D/g, '');

    if (digits.length === 11) {
      if (!this.isValidCPF(digits)) {
        throw new InvalidRegistrationNumber('Invalid CPF');
      }
      return new RegistrationNumber(digits, 'CPF');
    }

    if (digits.length === 14) {
      if (!this.isValidCNPJ(digits)) {
        throw new InvalidRegistrationNumber('Invalid CNPJ');
      }
      return new RegistrationNumber(digits, 'CNPJ');
    }

    throw new InvalidRegistrationNumber(`Invalid CPF/CNPJ: ${digits}`);
  }

  get value(): string {
    return this.digits;
  }

  get formatted(): string {
    return this.type === 'CPF'
      ? this.formatCPF(this.digits)
      : this.formatCNPJ(this.digits);
  }

  isCPF(): boolean {
    return this.type === 'CPF';
  }

  isCNPJ(): boolean {
    return this.type === 'CNPJ';
  }

  // ===== CPF =====

  private static isValidCPF(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calc = (factor: number) =>
      cpf
        .slice(0, factor - 1)
        .split('')
        .reduce((sum, n, i) => sum + Number(n) * (factor - i), 0);

    const d1 = ((calc(10) * 10) % 11) % 10;
    const d2 = ((calc(11) * 10) % 11) % 10;

    return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
  }

  private formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // ===== CNPJ =====

  private static isValidCNPJ(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const calc = (base: string, weights: number[]) =>
      base.split('').reduce((sum, n, i) => sum + Number(n) * weights[i], 0);

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, ...w1];

    const d1 = ((calc(cnpj.slice(0, 12), w1) * 10) % 11) % 10;
    const d2 = ((calc(cnpj.slice(0, 13), w2) * 10) % 11) % 10;

    return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
  }

  private formatCNPJ(cnpj: string): string {
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    );
  }
}
