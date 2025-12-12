import { Document } from '../value-objects/document.vo';
import { Email } from '../value-objects/email.vo';
import { Entity } from '../entity';
import { UUID } from 'node:crypto';

export interface CustomerProps {
  id?: string;
  name: string;
  email: Email;
  document: Document;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer extends Entity<CustomerProps> {
  protected constructor(props: CustomerProps, id?: UUID) {
    super(props, id);
  }

  public static create(
    props: {
      name: string;
      email: string;
      document: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
    id?: UUID,
  ): Customer {
    return new Customer(
      {
        ...props,
        email: new Email({ value: props.email }),
        document: new Document({ value: props.document }),
      },
      id,
    );
  }

  get id(): string {
    return this._id.toString();
  }

  get name(): string {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
  }

  get email(): Email {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = new Email({ value: email });
  }

  get document(): Document {
    return this.props.document;
  }

  set document(document: string) {
    this.props.document = new Document({ value: document });
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email.toJSON(),
      document: this.document.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
