import { InvalidEmailError } from './errors/invalid-email.error';

export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes('@')) {
      throw new InvalidEmailError(`Not a real email: ${value}`);
    }
    return new Email(value);
  }
}
