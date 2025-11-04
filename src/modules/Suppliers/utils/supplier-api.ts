import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../types/supplier';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const supplierApi = {
  async getAll(): Promise<Supplier[]> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener proveedores');
    }

    const data = await response.json();
    return data.data;
  },

  async getById(id: string): Promise<Supplier> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener proveedor');
    }

    const data = await response.json();
    return data.data;
  },

  async create(supplier: CreateSupplierDto): Promise<Supplier> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });

    if (!response.ok) {
      throw new Error('Error al crear proveedor');
    }

    const data = await response.json();
    return data.data;
  },

  async update(id: string, supplier: UpdateSupplierDto): Promise<Supplier> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplier),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar proveedor');
    }

    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar proveedor');
    }
  },
};
