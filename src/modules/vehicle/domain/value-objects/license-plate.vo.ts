import { ValueObject } from '@/shared/domain/value-object';

const PLATE_OLD_REGEX = /^[A-Z]{3}-?\d{4}$/;
const PLATE_MERCOSUL_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export class LicensePlate extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  static create(input: string): LicensePlate {
    if (!input || typeof input !== 'string') {
      throw new Error('LicensePlate input must be a non-empty string');
    }

    const normalized = input.toUpperCase().replace(/-/g, '').trim();
    const withDash =
      normalized.length === 7 && /^\d/.test(normalized[3])
        ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
        : normalized;

    if (
      PLATE_OLD_REGEX.test(withDash) ||
      PLATE_MERCOSUL_REGEX.test(normalized)
    ) {
      return new LicensePlate(normalized);
    }

    throw new Error(
      'Invalid license plate. Expected formats: ABC-1234 (old) or ABC1D23 (Mercosul)',
    );
  }

  static restore(value: string): LicensePlate {
    return new LicensePlate(value);
  }

  get raw(): string {
    return this._value;
  }

  get formatted(): string {
    // Mercosul: ABC1D23 → sem traço
    // Antiga: ABC1234 → ABC-1234
    if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(this._value)) {
      return this._value;
    }
    return `${this._value.slice(0, 3)}-${this._value.slice(3)}`;
  }

  get type(): 'old' | 'mercosul' {
    return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(this._value) ? 'mercosul' : 'old';
  }

  equals(other: LicensePlate): boolean {
    return this._value === other._value;
  }
}
