'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    rol?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User, expiresAt: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
    validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const TOKEN_VALIDATION_INTERVAL = 4 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const router = useRouter();
    const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isValidatingRef = useRef(false);

    const isTokenExpired = useCallback((): boolean => {
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiry) return true;

        const expiryDate = new Date(expiry);
        return new Date() >= expiryDate;
    }, []);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);

        if (validationIntervalRef.current) {
            clearInterval(validationIntervalRef.current);
            validationIntervalRef.current = null;
        }
    }, []);

    const validateSession = useCallback(async (): Promise<boolean> => {
        if (isValidatingRef.current) {
            return isAuthenticated;
        }

        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (!storedToken || isTokenExpired()) {
            clearAuthState();
            return false;
        }

        isValidatingRef.current = true;

        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

            const response = await api.get('/validate-token', {
                timeout: 10000,
            });

            if (response.data?.valid && response.data?.user) {
                const userData: User = {
                    id: response.data.user.id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    rol: response.data.user.rol,
                };

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem(USER_KEY, JSON.stringify(userData));

                return true;
            }

            clearAuthState();
            return false;

        } catch (error: any) {
            console.error('Error validando sesión:', error.message);

            if (error.response?.status === 401) {
                clearAuthState();
                router.push('/');
            }

            return false;
        } finally {
            isValidatingRef.current = false;
        }
    }, [isAuthenticated, isTokenExpired, clearAuthState, router]);

    const startTokenValidation = useCallback(() => {
        if (validationIntervalRef.current) {
            clearInterval(validationIntervalRef.current);
        }

        validationIntervalRef.current = setInterval(async () => {
            if (isTokenExpired()) {
                clearAuthState();
                router.push('/');
                return;
            }

            const isValid = await validateSession();
            if (!isValid) {
                router.push('/');
            }
        }, TOKEN_VALIDATION_INTERVAL);
    }, [validateSession, isTokenExpired, clearAuthState, router]);

    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);

            try {
                const storedToken = localStorage.getItem(TOKEN_KEY);
                const storedUser = localStorage.getItem(USER_KEY);

                if (storedToken && storedUser && !isTokenExpired()) {
                    const isValid = await validateSession();

                    if (isValid) {
                        startTokenValidation();
                    } else if (window.location.pathname !== '/') {
                        router.push('/');
                    }
                } else {
                    clearAuthState();
                    if (window.location.pathname !== '/') {
                        router.push('/');
                    }
                }
            } catch (error) {
                console.error('Error inicializando autenticación:', error);
                clearAuthState();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        return () => {
            if (validationIntervalRef.current) {
                clearInterval(validationIntervalRef.current);
            }
        };
    }, []);

    const login = useCallback(async (token: string, userData: User, expiresAt: string): Promise<void> => {
        try {
            if (!token?.trim()) {
                throw new Error('Token inválido');
            }

            if (!userData?.id || !userData?.email) {
                throw new Error('Datos de usuario incompletos');
            }

            if (!expiresAt) {
                throw new Error('Fecha de expiración no proporcionada');
            }

            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);

            setUser(userData);
            setIsAuthenticated(true);

            startTokenValidation();

            router.push('/dashboard');
        } catch (error) {
            console.error('Error en login:', error);
            clearAuthState();
            throw error;
        }
    }, [router, startTokenValidation, clearAuthState]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await api.post('/logout', {}, { timeout: 5000 });
        } catch (error) {
            console.error('Error cerrando sesión en backend:', error);
        } finally {
            clearAuthState();
            router.push('/');
        }
    }, [router, clearAuthState]);

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        validateSession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }

    return context;
};