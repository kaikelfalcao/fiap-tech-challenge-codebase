import { ValueObject } from '../value-object.vo';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { DomainError } from '../errors/domain.error';

export interface DocumentProps {
  value: string;
}

export interface IDocumentNormalized {
  type: 'cpf' | 'cnpj';
  value: string;
}

export class Document extends ValueObject<IDocumentNormalized> {
  constructor(props: DocumentProps) {
    super(Document.normalize(props.value));
    Document.validate(this.props);
  }

  private static normalize(raw: string): IDocumentNormalized {
    const value = raw.replace(/\D+/g, '');

    if (cpf.isValid(value)) return { type: 'cpf', value };
    if (cnpj.isValid(value)) return { type: 'cnpj', value };

    throw new DomainError('Invalid document');
  }

  private static validate(props: IDocumentNormalized): void {
    if (props.type === 'cpf' && !cpf.isValid(props.value)) {
      throw new DomainError('Invalid CPF');
    }
    if (props.type === 'cnpj' && !cnpj.isValid(props.value)) {
      throw new DomainError('Invalid CNPJ');
    }
  }

  get type(): 'cpf' | 'cnpj' {
    return this.props.type;
  }

  get value(): string {
    return this.props.value;
  }

  toJSON() {
    return this.value;
  }
}
