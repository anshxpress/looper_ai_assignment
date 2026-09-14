import axiosInstance from './axiosInstance';
import type { User, ApiResponse } from '../types';

export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const { data } = await axiosInstance.get('/users');
    return data;
  },
  
  create: async (userData: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.post('/users', userData);
    return data;
  },
  
  update: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const { data } = await axiosInstance.put(`/users/${id}`, userData);
    return data;
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await axiosInstance.delete(`/users/${id}`);
    return data;
  },
};
