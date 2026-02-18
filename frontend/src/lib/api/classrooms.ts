import apiClient from '../axios';
import { ApiResponse } from './types';

export interface Classroom {
    id: number;
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    grade: number;
    section: string;
    shift: 'MAÑANA' | 'TARDE' | null;
    capacity: number;
    full_name: string;
    students_count: number;
    tutor: { id: number; name: string } | null;
}

export interface ClassroomFormData {
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    grade: number;
    section: string;
    shift?: 'MAÑANA' | 'TARDE';
    capacity?: number;
}

export interface BulkClassroomData {
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    grades: number[];
    sections: string;
    shift?: 'MAÑANA' | 'TARDE';
    capacity?: number;
}

export const classroomService = {
    getAll: async (): Promise<Classroom[]> => {
        const response = await apiClient.get<ApiResponse<Classroom[]>>('/classrooms');
        return response.data.data;
    },

    getById: async (id: number): Promise<Classroom> => {
        const response = await apiClient.get<ApiResponse<Classroom>>(`/classrooms/${id}`);
        return response.data.data;
    },

    create: async (data: ClassroomFormData): Promise<{ message: string; classroom: Classroom }> => {
        const response = await apiClient.post<ApiResponse<Classroom>>('/classrooms', data);
        return { message: response.data.message, classroom: response.data.data };
    },

    bulkCreate: async (data: BulkClassroomData): Promise<{ message: string; created: number; skipped: number }> => {
        const response = await apiClient.post<ApiResponse<{ created: number; skipped: number }>>('/classrooms/bulk', data);
        return { message: response.data.message, ...response.data.data };
    },

    update: async (id: number, data: Partial<ClassroomFormData>): Promise<{ message: string; classroom: Classroom }> => {
        const response = await apiClient.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data);
        return { message: response.data.message, classroom: response.data.data };
    },

    delete: async (id: number): Promise<{ message: string }> => {
        const response = await apiClient.delete<ApiResponse<null>>(`/classrooms/${id}`);
        return { message: response.data.message };
    },
};
