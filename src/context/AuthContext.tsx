import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStoredAuth() {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet(['auth_token', 'auth_user']);
        if (cancelled) return;
        const t = storedToken[1];
        const u = storedUser[1];
        if (t && u) {
          setAuthToken(t);
          setToken(t);
          setUser(JSON.parse(u) as AuthUser);
        }
      } catch {
        // AsyncStorage unavailable or corrupted — proceed as logged out
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadStoredAuth();
    return () => { cancelled = true; };
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    await AsyncStorage.multiSet([
      ['auth_token', response.token],
      ['auth_user', JSON.stringify(response.user)],
    ]);
    setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }

  async function logout(): Promise<void> {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
