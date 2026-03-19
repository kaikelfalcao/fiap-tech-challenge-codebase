import { ValueObject } from '@/shared/domain/value-object';

export class Duration extends ValueObject {
  private readonly _minutes: number;

  private constructor(minutes: number) {
    super();
    this._minutes = minutes;
  }

  static create(minutes: number): Duration {
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error('Duration must be a positive integer (minutes)');
    }
    return new Duration(minutes);
  }

  static restore(minutes: number): Duration {
    return new Duration(minutes);
  }

  get minutes(): number {
    return this._minutes;
  }

  get formatted(): string {
    const h = Math.floor(this._minutes / 60);
    const m = this._minutes % 60;
    if (h === 0) {
      return `${m}min`;
    }
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}min`;
  }

  equals(other: Duration): boolean {
    return this._minutes === other._minutes;
  }
}
