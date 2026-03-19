export interface CustomerView {
  id: string;
  taxId: string;
  taxIdType: 'CPF' | 'CNPJ';
  fullName: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface ICustomerPublicApi {
  getByTaxId(taxId: string): Promise<CustomerView | null>;
}

export const CUSTOMER_PUBLIC_API = Symbol('ICustomerPublicApi');
