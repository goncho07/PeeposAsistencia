'use client';
import { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback, useRef } from 'react';
import { authService, LoginCredentials, AuthUser } from '@/lib/api/auth';
import { buildTenantPath } from '@/lib/axios';
import { getDefaultRoute } from '@/lib/auth/permissions';

export type User = AuthUser;

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const lastValidationRef = useRef<number>(0);

    const clearAuth = useCallback(() => {
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const response = await authService.getUser();
            setUser(response.user);
        } catch {
            clearAuth();
        }
    }, [clearAuth]);

    const validateSessionIfNeeded = useCallback(async () => {
        if (!user) return;

        const now = Date.now();
        if (now - lastValidationRef.current < 5 * 60 * 1000) {
            return;
        }

        lastValidationRef.current = now;
        try {
            await authService.getUser();
        } catch {
            clearAuth();
        }
    }, [user, clearAuth]);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await authService.getUser();
                setUser(response.user);
                lastValidationRef.current = Date.now();
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                validateSessionIfNeeded();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [validateSessionIfNeeded]);

    useEffect(() => {
        const handleFocus = () => {
            validateSessionIfNeeded();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [validateSessionIfNeeded]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials);

        setUser(data.user);
        lastValidationRef.current = Date.now();

        window.location.href = buildTenantPath(getDefaultRoute(data.user.role), data.user.tenant?.slug);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            //
        } finally {
            clearAuth();
            window.location.href = buildTenantPath('/login');
        }
    }, [clearAuth]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
    }), [user, isLoading, login, logout, refreshUser]);

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