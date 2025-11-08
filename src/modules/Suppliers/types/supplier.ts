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
  
  // Campos calculados desde el backend
  totalSupplied?: number;      // Total de purchaseOrders (suma de details)
  totalOrders?: number;         // Cantidad de órdenes de compra
  purchaseOrders?: any[];       // Relación con órdenes (opcional para el frontend)
}

export interface CreateSupplierDto {
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

/**
 * Interface para filtros de proveedores
 * Corresponde con los query params del backend
 */
export interface SupplierFilters {
  searchTerm?: string;           // Búsqueda por nombre o taxId
  minTotalSupplied?: number;     // Total mínimo suministrado
  maxTotalSupplied?: number;     // Total máximo suministrado
  withDeleted?: boolean;         // Incluir proveedores eliminados
}
