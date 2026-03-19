import { ValueObject } from '@/shared/domain/value-object';

export class ItemCode extends ValueObject {
  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  static create(input: string): ItemCode {
    if (!input || typeof input !== 'string') {
      throw new Error('ItemCode must be a non-empty string');
    }
    const clean = input.trim().toUpperCase();
    if (clean.length < 2 || clean.length > 50) {
      throw new Error('ItemCode must be between 2 and 50 characters');
    }
    if (!/^[A-Z0-9_-]+$/.test(clean)) {
      throw new Error(
        'ItemCode must contain only letters, numbers, hyphens and underscores',
      );
    }
    return new ItemCode(clean);
  }

  static restore(value: string): ItemCode {
    return new ItemCode(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ItemCode): boolean {
    return this._value === other._value;
  }
}
