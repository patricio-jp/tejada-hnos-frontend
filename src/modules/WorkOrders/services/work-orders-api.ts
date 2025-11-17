import type { WorkOrder, CreateActivityDTO, Activity, Input, UpdateWorkOrderDTO } from '@/types';
import apiClient from '@/lib/api-client';

export const workOrdersApi = {
  /**
   * Obtener todas las órdenes de trabajo asignadas al usuario actual
   */
  async getMyWorkOrders(token: string): Promise<WorkOrder[]> {
    return apiClient.get<WorkOrder[]>('/work-orders', { token });
  },

  /**
   * Obtener una orden de trabajo por ID
   */
  async getWorkOrderById(id: string, token: string): Promise<WorkOrder> {
    return apiClient.get<WorkOrder>(`/work-orders/${id}`, { token });
  },

  /**
   * Actualizar una orden de trabajo existente
   */
  async updateWorkOrder(id: string, data: UpdateWorkOrderDTO, token: string): Promise<WorkOrder> {
    return apiClient.put<WorkOrder>(`/work-orders/${id}`, data, { token });
  },

  /**
   * Crear una nueva actividad en una orden de trabajo
   */
  async createActivity(workOrderId: string, activityData: CreateActivityDTO, token: string): Promise<Activity> {
    return apiClient.post<Activity>(`/work-orders/${workOrderId}/activities`, activityData, { token });
  },

  /**
   * Obtener todos los insumos disponibles
   */
  async getInputs(token: string): Promise<Input[]> {
    return apiClient.get<Input[]>('/inputs', { token });
  },
};
