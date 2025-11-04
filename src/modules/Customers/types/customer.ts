export interface Customer {
  id: string;
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCustomerDto {
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;
