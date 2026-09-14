import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authApi.logout().catch(() => {}); // Ignore network errors on logout
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Validate session from backend on mount
  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const validUser = await authApi.me();
        setUser(validUser);
        localStorage.setItem('user', JSON.stringify(validUser));
      } catch (err) {
        console.error('Session validation failed:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [token, logout]);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
