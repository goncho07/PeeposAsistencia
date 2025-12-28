import apiClient from '../axios';

const requestCache = new Map<string, Promise<any>>();

const getCachedRequest = async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
    if (requestCache.has(key)) {
        return requestCache.get(key);
    }

    const promise = requestFn().finally(() => {
        setTimeout(() => requestCache.delete(key), 100);
    });

    requestCache.set(key, promise);
    return promise;
};

export interface Student {
    id: number;
    student_code: string;
    qr_code: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    document_type: string;
    document_number: string;
    gender: string;
    birth_date: string;
    age: number;
    academic_year: string;
    enrollment_status: string;
    photo_url: string | null;
    classroom?: {
        id: number;
        full_name: string;
        level: string;
        grade: number;
        section: string;
        shift: string;
        status: string;
        teacher?: {
            id: number;
            full_name: string;
        };
    };
    parents?: Array<{
        id: number;
        full_name: string;
        document_type: string;
        document_number: string;
        phone_number: string;
        email: string;
        relationship: {
            type: string;
            custom_label: string | null;
            is_primary_contact: boolean;
            receives_notifications: boolean;
            priority_order: number;
        };
    }>;
}

export interface Teacher {
    id: number;
    dni: string;
    qr_code: string;
    photo_url: string | null;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    birth_date: string;
    gender: string;
    level: string;
    area: string;
    email: string;
    phone_number: string;
    status: string;
    classrooms?: Array<{
        id: number;
        full_name: string;
        level: string;
        grade: number;
        section: string;
        shift: string;
        status: string;
        students_count?: number;
    }>;
}

export interface Parent {
    id: number;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    document_type: string;
    document_number: string;
    phone_number: string;
    email: string;
    photo_url: string | null;
    students?: Array<{
        id: number;
        student_code: string;
        full_name: string;
        document_number: string;
        enrollment_status: string;
        classroom?: {
            id: number;
            full_name: string;
        };
        relationship: {
            type: string;
            custom_label: string | null;
            is_primary_contact: boolean;
            receives_notifications: boolean;
            priority_order: number;
        };
    }>;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    dni: string;
    email: string;
    role: string;
    phone_number: string;
    photo_url: string | null;
    status: string;
    last_login_at?: string;
    last_login_ip?: string;
}

export type EntityType = 'student' | 'teacher' | 'parent' | 'user';
export type Entity = Student | Teacher | Parent | User;

export const usersService = {
    getStudents: async (search?: string, classroomId?: number): Promise<Student[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (classroomId) params.append('classroom_id', classroomId.toString());

        const cacheKey = `students-${params.toString()}`;
        return getCachedRequest(cacheKey, async () => {
            const response = await apiClient.get(`/students?${params.toString()}`);
            return response.data.data;
        });
    },

    getStudent: async (id: number): Promise<Student> => {
        const response = await apiClient.get(`/students/${id}`);
        return response.data.data;
    },

    createStudent: async (data: Partial<Student>): Promise<Student> => {
        const response = await apiClient.post('/students', data);
        return response.data.data;
    },

    updateStudent: async (id: number, data: Partial<Student>): Promise<Student> => {
        const response = await apiClient.put(`/students/${id}`, data);
        return response.data.data;
    },

    deleteStudent: async (id: number): Promise<void> => {
        await apiClient.delete(`/students/${id}`);
    },

    getTeachers: async (search?: string, level?: string, status?: string): Promise<Teacher[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('level', level);
        if (status) params.append('status', status);

        const cacheKey = `teachers-${params.toString()}`;
        return getCachedRequest(cacheKey, async () => {
            const response = await apiClient.get(`/teachers?${params.toString()}`);
            return response.data.data;
        });
    },

    getTeacher: async (id: number): Promise<Teacher> => {
        const response = await apiClient.get(`/teachers/${id}`);
        return response.data.data;
    },

    createTeacher: async (data: Partial<Teacher>): Promise<Teacher> => {
        const response = await apiClient.post('/teachers', data);
        return response.data.data;
    },

    updateTeacher: async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
        const response = await apiClient.put(`/teachers/${id}`, data);
        return response.data.data;
    },

    deleteTeacher: async (id: number): Promise<void> => {
        await apiClient.delete(`/teachers/${id}`);
    },

    getParents: async (search?: string): Promise<Parent[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);

        const cacheKey = `parents-${params.toString()}`;
        return getCachedRequest(cacheKey, async () => {
            const response = await apiClient.get(`/parents?${params.toString()}`);
            return response.data.data;
        });
    },

    getParent: async (id: number): Promise<Parent> => {
        const response = await apiClient.get(`/parents/${id}`);
        return response.data.data;
    },

    createParent: async (data: Partial<Parent>): Promise<Parent> => {
        const response = await apiClient.post('/parents', data);
        return response.data.data;
    },

    updateParent: async (id: number, data: Partial<Parent>): Promise<Parent> => {
        const response = await apiClient.put(`/parents/${id}`, data);
        return response.data.data;
    },

    deleteParent: async (id: number): Promise<void> => {
        await apiClient.delete(`/parents/${id}`);
    },

    getUsers: async (search?: string, role?: string, status?: string): Promise<User[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (status) params.append('status', status);

        const cacheKey = `users-${params.toString()}`;
        return getCachedRequest(cacheKey, async () => {
            const response = await apiClient.get(`/users?${params.toString()}`);
            return response.data.data;
        });
    },

    getUser: async (id: number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data;
    },

    createUser: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.post('/users', data);
        return response.data.data;
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    getClassrooms: async (search?: string, level?: string, shift?: string, status?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('level', level);
        if (shift) params.append('shift', shift);
        if (status) params.append('status', status);

        const cacheKey = `classrooms-${params.toString()}`;
        return getCachedRequest(cacheKey, async () => {
            const response = await apiClient.get(`/classrooms?${params.toString()}`);
            return response.data.data;
        });
    },
};
