import api from '../axios';

export interface CarnetFilters {
    type: 'all' | 'student' | 'teacher';
    level?: string;
    grade?: string;
    section?: string;
}

export interface CarnetJob {
    id: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    total_users: number;
    pdf_url?: string;
    error_message?: string;
    created_at: string;
    completed_at?: string;
}

export interface GenerateResponse {
    job_id: number;
    status: string;
    total_users: number;
    message: string;
}

export const carnetsService = {
    async generate(filters: CarnetFilters): Promise<GenerateResponse> {
        const response = await api.post<{ data: GenerateResponse }>('/carnets/generate', filters);
        return response.data.data;
    },

    async getStatus(jobId: number): Promise<CarnetJob> {
        const response = await api.get<{ data: CarnetJob }>(`/carnets/status/${jobId}`);
        return response.data.data;
    },

    async download(jobId: number): Promise<Blob> {
        const response = await api.get(`/carnets/download/${jobId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    async cancel(jobId: number): Promise<void> {
        await api.delete(`/carnets/${jobId}`);
    }
};
