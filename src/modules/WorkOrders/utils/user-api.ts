import apiClient from '@/lib/api-client';

export type User = {
  id: string;
  name: string;
  lastName: string;
  role: string;
};

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
