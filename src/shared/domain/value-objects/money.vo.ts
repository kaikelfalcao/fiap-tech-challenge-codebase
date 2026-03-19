import { ValueObject } from '@/shared/domain/value-object';

export class Money extends ValueObject {
  private readonly _amount: number;

  private constructor(amount: number) {
    super();
    this._amount = amount;
  }

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new Error('Money amount must be a non-negative integer (cents)');
    }
    return new Money(cents);
  }

  static fromDecimal(decimal: number): Money {
    if (decimal < 0) {
      throw new Error('Money amount must be non-negative');
    }
    return new Money(Math.round(decimal * 100));
  }

  static restore(cents: number): Money {
    return new Money(cents);
  }

  get cents(): number {
    return this._amount;
  }
  get decimal(): number {
    return this._amount / 100;
  }
  get formatted(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.decimal);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }
}
