import { CreateUserInput, UpdateUserInput, User } from '@/types/userTypes';
import axios from 'axios';

// تشخیص محیط Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// در محیط Tauri همیشه از localhost استفاده کن
// در محیط وب از متغیر محیطی یا localhost استفاده کن
const API_BASE_URL = isTauri
  ? 'http://127.0.0.1:3001/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// اضافه کردن interceptor برای هندل کردن خطاها
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('API Base URL:', API_BASE_URL);
    console.error('Is Tauri:', isTauri);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// توابع API برای کاربران
export const usersApi = {
  // دریافت همه کاربران
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  // دریافت یک کاربر
  getOne: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  // ایجاد کاربر
  create: async (input: CreateUserInput): Promise<User> => {
    const { data } = await api.post('/users', input);
    return data;
  },

  // به‌روزرسانی کاربر
  update: async (id: number, input: UpdateUserInput): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, input);
    return data;
  },

  // حذف کاربر
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
