import axiosInstance from './axiosInstance';
import type { LoginCredentials, AuthTokens, User } from '../types';

export const authApi = {
  /**
   * POST /api/auth/login
   * Returns JWT tokens + user info.
   */
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data;
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  /**
   * GET /api/auth/me  — validate current token and return user
   */
  me: async (): Promise<User> => {
    const { data } = await axiosInstance.get('/auth/me');
    return data.data;
  },

  updateProfile: async (profileData: { name: string; email: string }): Promise<User> => {
    const { data } = await axiosInstance.put('/auth/profile', profileData);
    return data.data;
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<void> => {
    await axiosInstance.put('/auth/password', passwordData);
  },
};
