import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types/customer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const customerApi = {
  async getAll(): Promise<Customer[]> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }

    const data = await response.json();
    return data.data;
  },

  async getById(id: string): Promise<Customer> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener cliente');
    }

    const data = await response.json();
    return data.data;
  },

  async create(customer: CreateCustomerDto): Promise<Customer> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      throw new Error('Error al crear cliente');
    }

    const data = await response.json();
    return data.data;
  },

  async update(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar cliente');
    }

    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar cliente');
    }
  },
};
