import { router } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { apiRequest, AuthResponse, User } from './api';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, avatarUrl?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      async login(email, password) {
        const response = await apiRequest<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setToken(response.data.accessToken);
        setUser(response.data.user);
        router.replace('/(tabs)');
      },
      async register(name, email, password) {
        const response = await apiRequest<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });

        setToken(response.data.accessToken);
        setUser(response.data.user);
        router.replace('/(tabs)');
      },
      async logout() {
        if (token) {
          await apiRequest('/auth/logout', { method: 'POST', token }).catch(() => null);
        }

        setToken(null);
        setUser(null);
        router.replace('/login');
      },
      async updateProfile(displayName, avatarUrl) {
        const response = await apiRequest<User>('/users/profile', {
          method: 'PATCH',
          token,
          body: JSON.stringify({ displayName, avatarUrl }),
        });

        setUser(response.data);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
