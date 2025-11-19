import type { Input, CreateInputDto, UpdateInputDto } from '@/types';
import apiClient from '@/lib/api-client';

export const inputsApi = {
  async getAll(token: string): Promise<Input[]> {
    return apiClient.get<Input[]>('/inputs', { token });
  },

  async getById(id: string, token: string): Promise<Input> {
    return apiClient.get<Input>(`/inputs/${id}`, { token });
  },

  async create(data: CreateInputDto, token: string): Promise<Input> {
    return apiClient.post<Input>('/inputs', data, { token });
  },

  async update(id: string, data: UpdateInputDto, token: string): Promise<Input> {
    return apiClient.put<Input>(`/inputs/${id}`, data, { token });
  },

  async remove(id: string, token: string): Promise<void> {
    return apiClient.delete<void>(`/inputs/${id}`, { token });
  },
};

export default inputsApi;
