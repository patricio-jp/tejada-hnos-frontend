export type AuthUser = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
}

/**
 * Usuario básico (para relaciones)
 */
export type User = AuthUser & {
  hourlyRate: number;
  assignedWorkOrders?: string[];
  managedFields?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateUserDto {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  hourlyRate: number;
}

export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  hourlyRate?: number;
}

export type AuthCredentials = {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }
}
