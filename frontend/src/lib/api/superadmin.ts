import apiClient from '../axios';
import { ApiResponse } from './types';

export interface TenantStats {
    tenants: {
        total: number;
        active: number;
        inactive: number;
    };
    users: number;
    students: number;
    teachers: number;
}

export interface TenantCounts {
    users: number;
    students: number;
    teachers: number;
    classrooms: number;
}

export interface Tenant {
    id: number;
    modular_code: string | null;
    name: string;
    slug: string;
    ruc: string | null;
    director_name: string | null;
    founded_year: number | null;
    institution_type: 'ESTATAL' | 'PRIVADA' | 'CONVENIO' | null;
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA' | 'MULTIPLE' | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    district: string | null;
    province: string | null;
    department: string | null;
    ugel: string | null;
    ubigeo: string | null;
    timezone: string | null;
    is_active: boolean;
    logo_url: string | null;
    banner_url: string | null;
    background_url: string | null;
    primary_color: string | null;
    last_activity_at: string | null;
    created_at: string;
    counts: TenantCounts;
}

export interface TenantFormData {
    code?: string;
    modular_code?: string;
    name: string;
    ruc?: string;
    institution_type?: 'ESTATAL' | 'PRIVADA' | 'CONVENIO';
    level?: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA' | 'MULTIPLE';
    email?: string;
    phone?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    ugel?: string;
    ubigeo?: string;
    timezone?: string;
    primary_color?: string;
    is_active?: boolean;
    director_name?: string;
    founded_year?: number;
}

export interface ImportValidationResult {
    headers: string[];
    total_rows: number;
    students_count: number;
    teachers_count: number;
    valid_rows: number;
    warnings: Array<{ row: number; message: string }>;
    errors: Array<{ row: number; message: string }>;
    preview: Record<string, string>[];
    can_import: boolean;
}

export interface ImportExecuteResult {
    students: { imported: number; updated: number; skipped: number };
    teachers: { imported: number; updated: number; skipped: number };
    errors: Array<{ row: number; message: string }>;
}

export interface ImportBatchResult {
    students: { imported: number; updated: number; skipped: number };
    teachers: { imported: number; updated: number; skipped: number };
    errors: Array<{ row: number; message: string }>;
    total: number;
    processed_offset: number;
    processed_count: number;
    has_more: boolean;
}

export interface ImportTemplate {
    headers: string[];
    example: string[];
}

export type WahaStatus = 'CONNECTED' | 'DISCONNECTED' | 'QR' | 'ERROR' | 'NO_PORT';

export interface WahaLevelStatus {
    level: string;
    port: number | null;
    status: WahaStatus;
    phone?: string | null;
}

export const superadminService = {
    getStats: async (): Promise<TenantStats> => {
        const response = await apiClient.get<ApiResponse<TenantStats>>('/superadmin/stats');
        return response.data.data;
    },

    getTenants: async (params?: { search?: string; is_active?: boolean }): Promise<Tenant[]> => {
        const response = await apiClient.get<ApiResponse<Tenant[]>>('/superadmin/tenants', { params });
        return response.data.data;
    },

    getTenant: async (id: number): Promise<Tenant> => {
        const response = await apiClient.get<ApiResponse<Tenant>>(`/superadmin/tenants/${id}`);
        return response.data.data;
    },

    createTenant: async (data: TenantFormData): Promise<{ message: string; tenant: Tenant }> => {
        const response = await apiClient.post<ApiResponse<Tenant>>('/superadmin/tenants', data);
        return { message: response.data.message, tenant: response.data.data };
    },

    updateTenant: async (id: number, data: Partial<TenantFormData>): Promise<{ message: string; tenant: Tenant }> => {
        const response = await apiClient.put<ApiResponse<Tenant>>(`/superadmin/tenants/${id}`, data);
        return { message: response.data.message, tenant: response.data.data };
    },

    deleteTenant: async (id: number): Promise<{ message: string }> => {
        const response = await apiClient.delete<ApiResponse<null>>(`/superadmin/tenants/${id}`);
        return { message: response.data.message };
    },

    toggleTenantActive: async (id: number): Promise<{ message: string; is_active: boolean }> => {
        const response = await apiClient.post<ApiResponse<{ is_active: boolean }>>(`/superadmin/tenants/${id}/toggle-active`);
        return { message: response.data.message, is_active: response.data.data.is_active };
    },

    uploadTenantImage: async (id: number, type: 'logo' | 'banner' | 'background', file: File): Promise<{ message: string; url: string }> => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('image', file);
        const response = await apiClient.post<ApiResponse<{ url: string }>>(`/superadmin/tenants/${id}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { message: response.data.message, url: response.data.data.url };
    },

    validateImport: async (file: File): Promise<ImportValidationResult> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<ApiResponse<ImportValidationResult>>('/superadmin/validate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    executeBatchImport: async (file: File, offset: number, batchSize: number): Promise<ImportBatchResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('offset', offset.toString());
        formData.append('batch_size', batchSize.toString());
        const response = await apiClient.post<ApiResponse<ImportBatchResult>>('/superadmin/execute-batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        });
        return response.data.data;
    },

    enterTenant: async (tenantId: number): Promise<{ message: string; tenant: { id: number; name: string; slug: string; logo_url: string | null } }> => {
        const response = await apiClient.post<ApiResponse<{ tenant: { id: number; name: string; slug: string; logo_url: string | null } }>>(`/superadmin/tenants/${tenantId}/enter`);
        return { message: response.data.message, tenant: response.data.data.tenant };
    },

    exitTenant: async (): Promise<{ message: string }> => {
        const response = await apiClient.post<ApiResponse<null>>('/superadmin/exit');
        return { message: response.data.message };
    },

    bulkCreateAcademicYear: async (data: {
        year: number;
        bimesters: Array<{ start_date: string; end_date: string }>;
    }): Promise<{ message: string; result: { created: number; skipped: number; errors: string[] } }> => {
        const response = await apiClient.post<ApiResponse<{ created: number; skipped: number; errors: string[] }>>('/superadmin/academic-years/bulk', data);
        return { message: response.data.message, result: response.data.data };
    },

    getWhatsAppStatus: async (tenantId: number): Promise<WahaLevelStatus[]> => {
        const response = await apiClient.get<{ data: WahaLevelStatus[] }>(`/superadmin/tenants/${tenantId}/whatsapp/status`);
        return response.data.data;
    },

    getWhatsAppQR: async (tenantId: number, level: string): Promise<string | null> => {
        const response = await apiClient.get<{ data: { qr: string | null } }>(`/superadmin/tenants/${tenantId}/whatsapp/qr/${level}`);
        return response.data.data.qr;
    },

    sendWhatsAppTest: async (tenantId: number, level: string, phone: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>(`/superadmin/tenants/${tenantId}/whatsapp/test`, { level, phone });
        return { message: response.data.message };
    },

    updateWhatsAppPort: async (tenantId: number, level: string, port: number): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>(`/superadmin/tenants/${tenantId}/whatsapp/port`, { level, port });
        return { message: response.data.message };
    },
};
