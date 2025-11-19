import apiClient from '@/lib/api-client';

export type SalesOrderStatus =
    | 'PENDIENTE'
    | 'APROBADA'
    | 'DESPACHADA_PARCIAL'
    | 'DESPACHADA_TOTAL'
    | 'PAGADA'
    | 'CERRADA'
    | 'CANCELLED';

export interface SalesOrderDetail {
    id: string;
    variety: string;
    caliber: string;
    quantityKg: number;
    unitPrice: number;
    subtotal?: number;       // Calculado por el backend
    quantityShipped: number;
    quantityPending?: number; // Calculado por el backend
    status: string;
}

export interface SalesOrderCustomer {
    id: string;
    name: string;
    taxId?: string;
    // Agregamos los que vimos en el JSON del backend
    contactEmail?: string;
    phoneNumber?: string;
    address?: string;
}

export interface SalesOrder {
    id: string;
    // code: string; // El backend NO devuelve un 'code', usamos el ID o sacamos esto.
    status: SalesOrderStatus;
    customer: SalesOrderCustomer;
    details: SalesOrderDetail[];
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

// Input para crear un detalle (lo que manda el formulario)
export interface CreateSalesOrderDetailInput {
    variety: string;
    caliber: string;
    quantityKg: number;
    unitPrice: number;
}

// Input para crear la orden (lo que espera el Backend DTO)
export interface CreateSalesOrderInput {
    customerId: string;
    details: CreateSalesOrderDetailInput[]; // ¡IMPORTANTE: details, no items!
}

async function getAll(token: string): Promise<SalesOrder[]> {
    const response = await apiClient.get<SalesOrder[]>('/sale-orders', {
        token,
    });
    // El backend devuelve { data: [...], message: ... } o directamente el array dependiendo del controller.
    // En tu PurchaseController devolvía { data: ... }.
    // Asumimos que el apiClient maneja el desempaquetado, o si no:
    // return (response as any).data || response;
    // Por ahora confiamos en el patrón de customer-api:
    return Array.isArray(response) ? response : (response as any).data || [];
}

async function create(data: CreateSalesOrderInput, token: string): Promise<SalesOrder> {
    return apiClient.post<SalesOrder>('/sale-orders', data, {
        token,
    });
}

async function remove(id: string, token: string): Promise<void> {
    await apiClient.delete(`/sale-orders/${id}`, {
        token,
    });
}

export const salesOrderApi = {
    getAll,
    create,
    remove,
};

export default salesOrderApi;