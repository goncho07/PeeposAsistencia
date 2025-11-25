'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  errors: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Solo intentamos cargar el usuario si tenemos indicio de sesión o estamos en rutas protegidas
        const { data } = await api.get('/user');
        setUser(data);
      } catch (error) {
        // Si falla (401), nos aseguramos que el usuario sea null
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: any) => {
    setErrors(null);
    try {
      // 1. CSRF Protection (Sanctum)
      await api.get('/sanctum/csrf-cookie');
      
      // 2. Login Request
      await api.post('/login', credentials);
      
      // 3. Fetch User Data
      const { data } = await api.get('/user');
      setUser(data);
      
      // 4. Redirect
      router.push('/dashboard');
    } catch (e: any) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        setErrors({ general: 'Error de conexión o credenciales inválidas' });
      }
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error("Logout error", error);
      // Forzar limpieza local incluso si falla la API
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, errors }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
