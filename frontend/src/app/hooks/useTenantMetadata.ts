'use client';
import { useEffect } from 'react';
import { useTenant } from '@/app/contexts/TenantProvider';
import { getStorageUrl } from '@/lib/axios';

export function useTenantMetadata() {
    const { tenant } = useTenant();

    useEffect(() => {
        if (!tenant) return;

        document.title = tenant.name ? `Peepos | ${tenant.name}` : 'Peepos Asistencia';
        
        if (tenant.logo_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = getStorageUrl(tenant.logo_url);
        }
    }, [tenant]);
}
