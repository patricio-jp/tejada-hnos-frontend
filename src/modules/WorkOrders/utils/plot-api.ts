import apiClient from '@/lib/api-client';

export type PlotSummary = {
  id: string;
  name: string;
  fieldId?: string;
  fieldName?: string;
  managerIds?: string[];
};

export const plotApi = {
  async getAll(token?: string | null): Promise<PlotSummary[]> {
    const response = await apiClient.get<PlotSummary[]>('/plots', {
      token: token ?? undefined,
    });
    return Array.isArray(response) ? response : [];
  },
};

export default plotApi;
