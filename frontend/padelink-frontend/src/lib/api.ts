const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  },

  async post<T>(path: string, body: any): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  },

  async patch<T>(path: string, body: any): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  },

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  },
};
