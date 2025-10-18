import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Orders endpoints
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  }
};

// Inventory endpoints
export const inventoryAPI = {
  getAll: async (category?: string) => {
    const response = await api.get('/inventory', { params: { category } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/inventory/${id}`, data);
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  }
};

// Menu endpoints
export const menuAPI = {
  getAll: async () => {
    const response = await api.get('/menu');
    return response.data;
  }
};

export default api;
