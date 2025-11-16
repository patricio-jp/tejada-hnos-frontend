import type { WorkOrder, CreateActivityDTO, Activity, Input } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const workOrdersApi = {
  /**
   * Obtener todas las órdenes de trabajo asignadas al usuario actual
   */
  async getMyWorkOrders(token: string): Promise<WorkOrder[]> {
    const response = await fetch(`${API_BASE_URL}/work-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar las órdenes de trabajo');
    }

    const { data } = await response.json();
    return data;
  },

  /**
   * Obtener una orden de trabajo por ID
   */
  async getWorkOrderById(id: string, token: string): Promise<WorkOrder> {
    const response = await fetch(`${API_BASE_URL}/work-orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar la orden de trabajo');
    }

    const { data } = await response.json();
    return data;
  },

  /**
   * Crear una nueva actividad en una orden de trabajo
   */
  async createActivity(workOrderId: string, activityData: CreateActivityDTO, token: string): Promise<Activity> {
    const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderId}/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const parsed = await response.json().catch(() => ({}));
      const message =
        (Array.isArray((parsed as any).errors) &&
          (parsed as any).errors.length > 0 &&
          (parsed as any).errors.map((e: any) => e.message).join('; ')) ||
        (parsed as any).message ||
        'Error al crear la actividad';
      throw new Error(message);
    }

    const { data } = await response.json();
    return data;
  },

  /**
   * Obtener todos los insumos disponibles
   */
  async getInputs(token: string): Promise<Input[]> {
    const response = await fetch(`${API_BASE_URL}/inputs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al cargar los insumos');
    }

    const { data } = await response.json();
    return data;
  },
};
