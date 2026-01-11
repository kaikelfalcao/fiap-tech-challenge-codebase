import { RegistrationNumber } from './../value-objects/registration-number.vo';
import { Email } from '../value-objects/email.vo';

export class Customer {
  protected constructor(
    public id: string | undefined,
    public name: string,
    public email: Email,
    public registrationNumber: RegistrationNumber,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public static create(
    name: string,
    email: string,
    registrationNumber: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    if (name.length < 2) {
      throw new Error('Invalid customer name');
    }

    return new Customer(
      id,
      name,
      Email.create(email),
      RegistrationNumber.create(registrationNumber),
      createdAt,
      updatedAt,
    );
  }

  changeName(name: string) {
    if (name.length < 2) {
      throw new Error('Invalid customer name');
    }
    this.name = name;
  }

  changeEmail(email: string) {
    const emailVO = Email.create(email);
    this.email = emailVO;
  }

  changeRegistrationNumber(number: string) {
    const registrationNumberVO = RegistrationNumber.create(number);
    this.registrationNumber = registrationNumberVO;
  }
}
