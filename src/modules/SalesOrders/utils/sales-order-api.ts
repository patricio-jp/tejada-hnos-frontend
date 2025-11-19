import apiClient from '@/lib/api-client';
import type { CreateSalesOrderDTO, SalesOrder } from '@/types';

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

async function create(data: CreateSalesOrderDTO, token: string): Promise<SalesOrder> {
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
