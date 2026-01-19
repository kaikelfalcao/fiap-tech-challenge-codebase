import { Customer } from '@domain/customer/customer.entity';

export class CustomerPresenter {
  static toResponse(customer: Customer) {
    return {
      id: customer.id!,
      name: customer.name,
      email: customer.email.value,
      registrationNumber: customer.registrationNumber.formatted,
      createdAt: customer.createdAt?.toISOString(),
      updatedAt: customer.updatedAt?.toISOString(),
    };
  }
}
