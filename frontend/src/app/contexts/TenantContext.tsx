'use client';
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { tenantService, Tenant } from '@/lib/api/tenant';
import { getStorageUrl } from '@/lib/axios';
import { useAuth } from './AuthContext';

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    error: string | null;
    getLogoUrl: () => string;
    getBannerUrl: (theme?: 'light' | 'dark') => string;
    getBackgroundUrl: () => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const tenantSlug = params.tenant as string;
    const { user, isLoading: authLoading } = useAuth();

    const isFetching = useRef(false);
    const lastLoadedSlug = useRef<string | null>(null);
    const tenantRef = useRef<Tenant | null>(null);

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        tenantRef.current = tenant;
    }, [tenant]);

    useEffect(() => {
        const loadTenant = async () => {
            if (authLoading) return;

            if (!tenantSlug) {
                setLoading(false);
                return;
            }

            if (lastLoadedSlug.current === tenantSlug && tenantRef.current) {
                setLoading(false);
                return;
            }

            if (isFetching.current) return;

            if (user?.tenant?.slug === tenantSlug) {
                setTenant(user.tenant);
                lastLoadedSlug.current = tenantSlug;
                setLoading(false);
                setError(null);
                return;
            }

            try {
                isFetching.current = true;
                setLoading(true);
                const data = await tenantService.getBySlug(tenantSlug);
                setTenant(data);
                lastLoadedSlug.current = tenantSlug;
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Tenant no encontrado');
                setTenant(null);
                lastLoadedSlug.current = null;
            } finally {
                setLoading(false);
                isFetching.current = false;
            }
        };

        loadTenant();
    }, [tenantSlug, user?.tenant, authLoading]);

    useEffect(() => {
        if (!tenant) return;

        document.title = tenant.name || 'Sistema Asistencia';

        if (tenant.logo_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = getStorageUrl(tenant.logo_url);
        }
    }, [tenant, pathname]);

    const getLogoUrl = useCallback(() => {
        return getStorageUrl(tenant?.logo_url);
    }, [tenant?.logo_url]);

    const getBannerUrl = useCallback((theme?: 'light' | 'dark') => {
        if (!tenant?.banner_url) return '';
        if (!theme) return getStorageUrl(tenant.banner_url);

        const suffix = theme === 'dark' ? '_dark' : '_white';
        const formattedUrl = tenant.banner_url.replace(/(\.[\w\d]+)$/, `${suffix}$1`);

        return getStorageUrl(formattedUrl);
    }, [tenant?.banner_url]);

    const getBackgroundUrl = useCallback(() => {
        return getStorageUrl(tenant?.background_url);
    }, [tenant?.background_url]);

    const value = useMemo(() => ({
        tenant,
        loading,
        error,
        getLogoUrl,
        getBannerUrl,
        getBackgroundUrl,
    }), [tenant, loading, error, getLogoUrl, getBannerUrl, getBackgroundUrl]);

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant debe usarse dentro de TenantProvider');
    }
    return context;
}