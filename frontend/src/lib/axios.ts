import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            if (!window.location.pathname.includes('/login')) {
                const isAdmin = window.location.pathname.startsWith('/admin');
                window.location.href = isAdmin ? '/admin/login' : buildTenantPath('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

export const buildTenantPath = (path: string, slug?: string | null): string => {
    if (typeof window === 'undefined') return path;
    const host = window.location.hostname;
    const isDev = host === 'localhost' || host === '127.0.0.1';
    if (!isDev) return path;
    const tenantSlug = slug || window.location.pathname.split('/').filter(Boolean)[0];
    if (!tenantSlug) return path;
    return `/${tenantSlug}${path}`;
};

export const getStorageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const bucket = process.env.NEXT_PUBLIC_GCS_BUCKET || 'peeposasistencia-storage';
    return `https://storage.googleapis.com/${bucket}/${path}`;
};