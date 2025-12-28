import apiClient from '../axios';

export interface LoginCredentials {
    email: string;
    password: string;
    remember_me?: boolean;
    device_name?: string;
    tenant_slug?: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: any;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform || 'Unknown';
        const deviceName = `${platform} - ${userAgent.split(')')[0].replace('(', '')}`;

        const response = await apiClient.post('/auth/login', {
            ...credentials,
            device_name: deviceName.substring(0, 255),
        });

        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getUser: async () => {
        const response = await apiClient.get('/auth/user');
        return response.data;
    },

    refresh: async () => {
        const response = await apiClient.post('/auth/refresh');
        return response.data;
    },
};