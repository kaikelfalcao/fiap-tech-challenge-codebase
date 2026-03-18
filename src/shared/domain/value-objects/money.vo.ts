import { ValueObject } from '../value-object';

export class Money extends ValueObject {
  private readonly cents: number;

  private constructor(cents: number) {
    super();
    this.cents = cents;
  }

  public static zero(): Money {
    return new Money(0);
  }

  public static from(value: number): Money {
    if (value === null || value === undefined) {
      throw new Error('Money value cannot be null or undefined');
    }

    if (Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error('Money value must be a valid number');
    }

    const cents = Math.round(value * 100);

    return new Money(cents);
  }

  private static fromCents(cents: number): Money {
    return new Money(cents);
  }

  public add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  public subtract(other: Money): Money {
    return Money.fromCents(this.cents - other.cents);
  }

  public multiply(factor: number): Money {
    if (Number.isNaN(factor) || !Number.isFinite(factor)) {
      throw new Error('Factor must be a valid number');
    }

    const result = Math.round(this.cents * factor);

    return Money.fromCents(result);
  }

  public greaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  public lessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  public equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  public get centsValue(): number {
    return this.cents;
  }

  public get value(): number {
    return this.cents / 100;
  }
}
