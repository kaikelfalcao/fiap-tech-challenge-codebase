import { ValueObject } from '../value-object.vo';
import { DomainError } from '../errors/domain.error';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  constructor(props: EmailProps) {
    super({ value: Email.normalize(props.value) });
    this.validate();
  }

  private static normalize(v: string): string {
    return v.trim().toLowerCase();
  }

  private validate() {
    const v = this.props.value;
    if (v.length < 6) throw new DomainError('Invalid email');
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!regex.test(v)) throw new DomainError('Invalid email');
  }

  get value(): string {
    return this.props.value;
  }

  toJSON() {
    return this.value;
  }
}
