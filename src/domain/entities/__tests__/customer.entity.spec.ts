import { Email } from 'src/domain/value-objects/email.vo';
import { Customer } from '../customer.entity';
import { RegistrationNumber } from 'src/domain/value-objects/registration-number.vo';
import { cpf } from '@dmalbuquerque/cpf-cnpj-validator';

describe('Customer entity', () => {
  it('should create a valid customer', () => {
    const customer = Customer.create(
      'John Doe',
      'john.doe@email.com',
      cpf.generate(),
      'customer-id-1',
    );

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.name).toBe('John Doe');
    expect(customer.email).toBeInstanceOf(Email);
    expect(customer.registrationNumber).toBeInstanceOf(RegistrationNumber);
    expect(customer.id).toBe('customer-id-1');
  });

  it('should throw an error if name is too short', () => {
    expect(() => {
      Customer.create('J', 'john.doe@email.com', cpf.generate());
    }).toThrow('Invalid customer name');
  });

  it('should throw an error if email is invalid', () => {
    expect(() => {
      Customer.create('John Doe', 'invalid-email', cpf.generate());
    }).toThrow();
  });

  it('should throw an error if registration number is invalid', () => {
    expect(() => {
      Customer.create('John Doe', 'john.doe@email.com', 'invalid-registration');
    }).toThrow();
  });
});
