import apiClient from '@/lib/api-client';
import type { User } from '@/types';

async function getAllUsers(accessToken: string): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users', {
    token: accessToken,
  });

  return Array.isArray(response) ? response : [];
}

export const userApi = {
  getAllUsers,
};

export default userApi;
