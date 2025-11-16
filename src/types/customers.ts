/**
 * Tipos e interfaces para el módulo de Customers
 */

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
  
  // Propiedades calculadas por el backend
  totalSpent?: number;      // Total gastado calculado
  totalOrders?: number;     // Total de órdenes
  salesOrders?: any[];      // Órdenes de venta (opcional)
}

export interface CreateCustomerDto {
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export interface CustomerFilters {
  searchTerm?: string;
  minTotalPurchases?: number;
  maxTotalPurchases?: number;
  withDeleted?: boolean;
}
