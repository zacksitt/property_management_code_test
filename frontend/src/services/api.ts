import axios from 'axios';
import type { Property, Task, CreatePropertyDto, CreateTaskDto, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Property API
export const propertyAPI = {
  getAll: (params?: Record<string, string | number>) => 
    api.get<PaginatedResponse<Property>>('/properties', { params }),
  getVacant: () => api.get<Property[]>('/properties/vacant'),
  getOne: (id: string) => api.get<Property>(`/properties/${id}`),
  create: (data: CreatePropertyDto) => api.post<Property>('/properties', data),
  update: (id: string, data: Partial<CreatePropertyDto>) => 
    api.patch<Property>(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getTasks: (id: string) => api.get<Task[]>(`/properties/${id}/tasks`),
};

// Task API
export const taskAPI = {
  getAll: (params?: Record<string, string | number>) => 
    api.get<PaginatedResponse<Task>>('/tasks', { params }),
  getOne: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (data: CreateTaskDto) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<CreateTaskDto>) => 
    api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

