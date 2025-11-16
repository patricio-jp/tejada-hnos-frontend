import apiClient from '@/lib/api-client';
import type { CreateWorkOrderDTO, UpdateWorkOrderDTO, WorkOrder } from '@/types';

function readToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('access_token');
}

export const workOrderApi = {
  getAll(): Promise<WorkOrder[]> {
    const token = readToken();
    return apiClient.get<WorkOrder[]>('/work-orders', { token });
  },
  getById(id: string): Promise<WorkOrder> {
    const token = readToken();
    return apiClient.get<WorkOrder>(`/work-orders/${id}`, { token });
  },
  create(data: CreateWorkOrderDTO): Promise<WorkOrder> {
    const token = readToken();
    return apiClient.post<WorkOrder>('/work-orders', data, { token });
  },
  update(id: string, data: UpdateWorkOrderDTO): Promise<WorkOrder> {
    const token = readToken();
    return apiClient.put<WorkOrder>(`/work-orders/${id}`, data, { token });
  },
};

export default workOrderApi;
