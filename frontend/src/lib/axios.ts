import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    transformResponse: [(data) => {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }],
});

apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                let tenantSlug = null;
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        tenantSlug = user.tenant?.slug;
                    }
                } catch {
                    // Ignorar
                }

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                document.cookie = 'token=; path=/; max-age=0';
                document.cookie = 'user=; path=/; max-age=0';

                const loginPath = tenantSlug ? `/${tenantSlug}/login` : '/';
                window.location.href = loginPath;
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

export const getStorageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${baseUrl.replace('/api', '')}/storage/${path}`;
};