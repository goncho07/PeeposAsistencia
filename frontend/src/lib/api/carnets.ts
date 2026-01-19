import api from '../axios';

export interface CarnetFilters {
    type: 'all' | 'student' | 'teacher';
    level?: string;
    grade?: string;
    section?: string;
}

export interface SSEProgressEvent {
    progress: number;
    phase: 'html' | 'pdf' | 'complete';
    message?: string;
}

export interface SSEStartEvent {
    total_users: number;
    message: string;
}

export interface SSECompletedEvent {
    pdf_url: string;
    pdf_path: string;
    message: string;
}

export interface SSEErrorEvent {
    message: string;
}

export const carnetsService = {
    async getCount(filters: CarnetFilters): Promise<number> {
        const response = await api.post<{ data: { count: number } }>('/carnets/count', filters);
        return response.data.data.count;
    },

    async download(pdfPath: string): Promise<Blob> {
        const encodedPath = btoa(pdfPath);
        const response = await api.get(`/carnets/download/${encodedPath}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getGenerateUrl(): string {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        return `${baseUrl}/carnets/generate`;
    }
};
