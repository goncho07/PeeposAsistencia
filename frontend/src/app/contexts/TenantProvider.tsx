'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { tenantService, Tenant } from '@/lib/api/tenant';
import { getStorageUrl } from '@/lib/axios';

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
    const tenantSlug = params.tenant as string;

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantSlug) {
            setLoading(false);
            return;
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.tenant && user.tenant.slug === tenantSlug) {
                    setTenant(user.tenant);
                    setLoading(false);
                    return;
                }
            } catch {
                // Continuar
            }
        }

        tenantService.getBySlug(tenantSlug)
            .then(data => {
                setTenant(data);
                setError(null);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Tenant no encontrado');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [tenantSlug]);

    const getLogoUrl = () => getStorageUrl(tenant?.logo_url);

    const getBannerUrl = (theme?: 'light' | 'dark') => {
        if (!tenant?.banner_url) return '';

        if (theme) {
            const url = tenant.banner_url;
            const lastDotIndex = url.lastIndexOf('.');

            if (lastDotIndex !== -1) {
                const baseName = url.substring(0, lastDotIndex);
                const extension = url.substring(lastDotIndex);
                const suffix = theme === 'dark' ? '_dark' : '_white';
                return getStorageUrl(`${baseName}${suffix}${extension}`);
            }
        }

        return getStorageUrl(tenant.banner_url);
    };

    const getBackgroundUrl = () => getStorageUrl(tenant?.background_url);

    return (
        <TenantContext.Provider value={{
            tenant,
            loading,
            error,
            getLogoUrl,
            getBannerUrl,
            getBackgroundUrl,
        }}>
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