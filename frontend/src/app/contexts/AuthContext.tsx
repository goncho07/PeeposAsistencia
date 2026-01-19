'use client';
import { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from 'react';
import { authService, LoginCredentials } from '@/lib/api/auth';
import { Tenant } from '@/lib/api/tenant';
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    email: string;
    name: string;
    dni?: string;
    role: string;
    tenant_id: number;
    tenant?: Tenant;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setUser(null);
                    return;
                }

                const response = await authService.getUser();
                setUser(response.user);
            } catch (error) {
                console.error('Token inválido o expirado:', error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials);

        localStorage.setItem('token', data.access_token);
        setUser(data.user);

        const tenantSlug = data.user.tenant?.slug || 'dashboard';
        router.push(`/${tenantSlug}/dashboard`);
    }, [router]);

    const logout = useCallback(async () => {
        const tenantSlug = user?.tenant?.slug ||
            (typeof window !== 'undefined'
                ? window.location.pathname.split('/').filter(Boolean)[0]
                : 'login');

        try {
            await authService.logout();
        } catch (error) {
            console.error('Error durante logout:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            router.push(`/${tenantSlug}/login`);
        }
    }, [user?.tenant?.slug, router]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    }), [user, isLoading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
