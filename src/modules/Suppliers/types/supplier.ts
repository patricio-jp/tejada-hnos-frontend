export interface Supplier {
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

export interface CreateSupplierDto {
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;
