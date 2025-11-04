import type { Variety, CreateVarietyDto, UpdateVarietyDto } from '../types/variety';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const varietyApi = {
  async getAll(): Promise<Variety[]> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/varieties`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener variedades');
    }

    const data = await response.json();
    return data.data;
  },

  async getById(id: string): Promise<Variety> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/varieties/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener variedad');
    }

    const data = await response.json();
    return data.data;
  },

  async create(variety: CreateVarietyDto): Promise<Variety> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/varieties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variety),
    });

    if (!response.ok) {
      throw new Error('Error al crear variedad');
    }

    const data = await response.json();
    return data.data;
  },

  async update(id: string, variety: UpdateVarietyDto): Promise<Variety> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/varieties/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variety),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar variedad');
    }

    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/varieties/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al eliminar variedad');
    }
  },
};
