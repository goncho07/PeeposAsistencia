import apiClient from '../axios';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    code: string;
    ugel: string;
    logo_url: string | null;
    banner_url: string | null;
    background_url: string | null;
}

export const tenantService = {
    getBySlug: async (slug: string): Promise<Tenant> => {
        const response = await apiClient.get(`/tenants/${slug}`);
        return response.data;
    },
};