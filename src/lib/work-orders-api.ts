/**
 * API cliente para Work Orders
 */

import type { WorkOrder, CreateActivityDto, Activity, Input } from '@/modules/WorkOrders/types/work-orders';

const API_BASE_URL = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

export const workOrdersApi = {
  /**
   * Obtener todas las work orders asignadas al operario actual
   */
  async getMyWorkOrders(): Promise<WorkOrder[]> {
    const response = await fetchWithAuth('/work-orders');
    return response.data;
  },

  /**
   * Obtener una work order por ID
   */
  async getWorkOrderById(id: string): Promise<WorkOrder> {
    const response = await fetchWithAuth(`/work-orders/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva actividad en una work order
   */
  async createActivity(workOrderId: string, data: Omit<CreateActivityDto, 'workOrderId'>): Promise<Activity> {
    const response = await fetchWithAuth(`/work-orders/${workOrderId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Obtener todos los insumos disponibles
   */
  async getInputs(): Promise<Input[]> {
    const response = await fetchWithAuth('/inputs');
    return response.data;
  },
};
