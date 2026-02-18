import apiClient from '../axios';
import { ApiResponse } from './types';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    modular_code?: string;
    ugel?: string;
    logo_url?: string | null;
    banner_url?: string | null;
    background_url?: string | null;
    institution_type?: string;
    level?: string;
    timezone?: string;
    primary_color?: string | null;
}

export const tenantService = {
    getBySlug: async (slug: string): Promise<Tenant> => {
        const response = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${slug}`);
        return response.data.data;
    },
};

export function getTenantFromHost(hostname: string): string | null {
    const cleanHost = hostname.toLowerCase().replace(/:\d+$/, '');

    const domainAliases: Record<string, string> = {
        'bolognesi.edu.pe': 'iefranciscobolognesi',
        'ieericardopalma.intelicole.pe': 'ieericardopalma',
    };

    if (domainAliases[cleanHost]) {
        return domainAliases[cleanHost];
    }

    const baseDomains = ['intelicole.pe'];
    const baseDomain = baseDomains.find((d) =>
        cleanHost.endsWith(`.${d}`)
    );

    if (!baseDomain) return null;

    const subdomain = cleanHost.replace(`.${baseDomain}`, '');
    if (!subdomain || subdomain === 'www') return null;

    return subdomain;
}
