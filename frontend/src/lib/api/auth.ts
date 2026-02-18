import axios from 'axios';
import apiClient from '../axios';
import { ApiResponse } from './types';

export interface LoginCredentials {
    email: string;
    password: string;
    remember_me?: boolean;
    tenant_slug?: string;
}

export interface AuthUser {
    id: number;
    name: string;
    first_name?: string;
    paternal_surname?: string;
    maternal_surname?: string;
    email: string;
    document_type?: string;
    document_number?: string;
    role: string;
    status?: string;
    phone_number?: string;
    photo_url?: string;
    last_login_at?: string;
    tenant_id: number | null;
    tenant: {
        id: number;
        name: string;
        code?: string;
        modular_code?: string;
        ugel?: string;
        slug: string;
        logo_url?: string;
        banner_url?: string;
        background_url?: string;
        institution_type?: string;
        level?: string;
        timezone?: string;
    } | null;
    viewing_tenant?: boolean;
}

export interface LoginResponse {
    user: AuthUser;
}

export interface UserResponse {
    user: AuthUser;
}

export interface UpdateProfilePayload {
    name?: string;
    paternal_surname?: string;
    maternal_surname?: string;
    phone_number?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface SessionInfo {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    last_activity: string;
    is_current: boolean;
}

export const authService = {
    getCsrfCookie: async (): Promise<void> => {
        const baseUrl = apiClient.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
        await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
            withCredentials: true,
        });
    },


    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        await authService.getCsrfCookie();

        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);

        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getUser: async (): Promise<UserResponse> => {
        const response = await apiClient.get<ApiResponse<UserResponse>>('/auth/user');
        return response.data.data;
    },

    updateProfile: async (data: UpdateProfilePayload): Promise<UserResponse> => {
        const response = await apiClient.put<ApiResponse<UserResponse>>('/auth/profile', data);
        return response.data.data;
    },

    changePassword: async (data: ChangePasswordPayload): Promise<void> => {
        await apiClient.post('/auth/change-password', data);
    },

    getSessions: async (): Promise<SessionInfo[]> => {
        const response = await apiClient.get<ApiResponse<{ sessions: SessionInfo[] }>>('/auth/sessions');
        return response.data.data.sessions;
    },

    revokeSession: async (sessionId: string): Promise<void> => {
        await apiClient.delete(`/auth/sessions/${sessionId}`);
    },

    logoutAll: async (): Promise<void> => {
        await apiClient.post('/auth/logout-all');
    },
};