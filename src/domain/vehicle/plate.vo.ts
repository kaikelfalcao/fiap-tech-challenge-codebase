import { ValidationError } from '@shared/errors/validation.error';

export class Plate {
  private constructor(public readonly value: string) {}

  static create(value: string): Plate {
    if (!value) {
      throw new ValidationError('Invalid Plate');
    }

    // Padrão Mercosul: ABC1D23 ou padrão antigo: ABC1234
    const mercosul = /^[A-Z]{3}-\d[A-Z0-9]\d{2}$/;
    const antigo = /^[A-Z]{3}\d{4}$/;

    if (!mercosul.test(value) && !antigo.test(value)) {
      throw new ValidationError('Invalid Plate');
    }
    return new Plate(value);
  }
}
