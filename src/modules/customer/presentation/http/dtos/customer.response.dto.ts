export class CustomerResponseDto {
  id: string;
  taxId: string;
  taxIdType: 'CPF' | 'CNPJ';
  fullName: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedCustomersResponseDto {
  data: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
}
