import apiClient from '../axios';
import { ApiResponse } from './types';

export interface Bimester {
    id: number;
    number: number;
    start_date: string;
    end_date: string;
}

export interface AcademicYear {
    id: number;
    year: number;
    start_date: string;
    end_date: string;
    status: 'PLANIFICADO' | 'ACTIVO' | 'FINALIZADO';
    is_current: boolean;
    bimesters: Bimester[];
}

export interface CreateAcademicYearData {
    year: number;
    bimesters: Array<{
        start_date: string;
        end_date: string;
    }>;
}

export interface UpdateAcademicYearData {
    bimesters: Array<{
        number: number;
        start_date: string;
        end_date: string;
    }>;
}

export const academicYearService = {
    getAll: async (): Promise<AcademicYear[]> => {
        const response = await apiClient.get<ApiResponse<AcademicYear[]>>('/academic-years');
        return response.data.data;
    },

    getCurrent: async (): Promise<AcademicYear> => {
        const response = await apiClient.get<ApiResponse<AcademicYear>>('/academic-years/current');
        return response.data.data;
    },

    getById: async (id: number): Promise<AcademicYear> => {
        const response = await apiClient.get<ApiResponse<AcademicYear>>(`/academic-years/${id}`);
        return response.data.data;
    },

    create: async (data: CreateAcademicYearData): Promise<AcademicYear> => {
        const response = await apiClient.post<ApiResponse<AcademicYear>>('/academic-years', data);
        return response.data.data;
    },

    update: async (id: number, data: UpdateAcademicYearData): Promise<AcademicYear> => {
        const response = await apiClient.put<ApiResponse<AcademicYear>>(`/academic-years/${id}`, data);
        return response.data.data;
    },

    activate: async (id: number): Promise<AcademicYear> => {
        const response = await apiClient.post<ApiResponse<AcademicYear>>(`/academic-years/${id}/activate`);
        return response.data.data;
    },

    finalize: async (id: number): Promise<AcademicYear> => {
        const response = await apiClient.post<ApiResponse<AcademicYear>>(`/academic-years/${id}/finalize`);
        return response.data.data;
    },
};
