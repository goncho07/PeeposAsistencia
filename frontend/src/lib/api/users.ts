import apiClient from '../axios';
import { ApiResponse, buildQueryParams } from './types';

export interface Student {
    id: number;
    qr_code: string;
    student_code: string;
    document_type: string;
    document_number: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    gender: string;
    birth_date: string | null;
    birth_place: string | null;
    nationality: string | null;
    age: number;
    photo_url: string | null;
    academic_year: string;
    enrollment_status: string;
    classroom_id: number | null;
    classroom?: {
        id: number;
        full_name: string;
        level: string;
        grade: number;
        section: string;
        shift: string;
        tutor?: {
            id: number;
            full_name: string;
        } | null;
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
        };
    }>;
}

export interface Teacher {
    id: number;
    user_id: number;
    qr_code: string;
    document_type: string;
    document_number: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    email: string;
    phone_number: string;
    photo_url: string | null;
    level: string;
    specialty: string | null;
    user?: {
        id: number;
        email: string;
        role: string;
        status: string;
        last_login_at: string | null;
    };
    tutored_classrooms?: Array<{
        id: number;
        full_name: string;
        level: string;
        grade: number;
        section: string;
        shift: string;
    }>;
    classrooms?: Array<{
        id: number;
        full_name: string;
        level: string;
        grade: number;
        section: string;
        shift: string;
        subject: string | null;
        academic_year: string;
    }>;
}

export interface Parent {
    id: number;
    document_type: string;
    document_number: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    photo_url: string | null;
    phone_number: string;
    phone_number_secondary: string | null;
    email: string;
    address: string | null;
    students?: Array<{
        id: number;
        student_code: string;
        full_name: string;
        document_number: string;
        enrollment_status: string;
        classroom?: {
            id: number;
            full_name: string;
        } | null;
        relationship: {
            type: string;
            custom_label: string | null;
            is_primary_contact: boolean;
            receives_notifications: boolean;
        };
    }>;
    students_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    document_type: string;
    document_number: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    photo_url: string | null;
    email: string;
    role: string;
    phone_number: string;
    qr_code: string | null;
    status: string;
    last_login_at?: string;
    last_login_ip?: string;
    teacher?: {
        id: number;
        level: string;
        specialty: string | null;
    };
}

export interface Classroom {
    id: number;
    full_name: string;
    level: string;
    grade: number;
    grade_name: string;
    section: string;
    shift: string;
    capacity: number;
    tutor_id: number | null;
    tutor?: {
        id: number;
        full_name: string;
        document_number: string;
        email: string;
        phone_number: string;
        specialty: string | null;
    } | null;
    teachers?: Array<{
        id: number;
        full_name: string;
        specialty: string | null;
        subject: string | null;
        academic_year: string;
    }>;
    students?: Array<{
        id: number;
        student_code: string;
        full_name: string;
        document_number: string;
        enrollment_status: string;
    }>;
    students_count?: number;
    created_at?: string;
    updated_at?: string;
}

export type EntityType = 'student' | 'teacher' | 'parent' | 'user';
export type Entity = Student | Teacher | Parent | User;

export interface ParentAssignment {
    parent_id: number;
    relationship_type: string;
    custom_relationship_label?: string | null;
    is_primary_contact: number | boolean;
    receives_notifications: number | boolean;
}

export interface StudentAssignment {
    student_id: number;
    relationship_type: string;
    custom_relationship_label?: string | null;
    is_primary_contact: number | boolean;
    receives_notifications: number | boolean;
}

export type StudentUpdateData = Partial<Omit<Student, 'parents'>> & {
    photo?: File | null;
    parents?: ParentAssignment[];
};

export type ParentUpdateData = Partial<Omit<Parent, 'students'>> & {
    students?: StudentAssignment[];
};

export type StudentExpand = 'classroom' | 'parents';
export type TeacherExpand = 'user' | 'tutored_classrooms' | 'classrooms';
export type ParentExpand = 'students';
export type UserExpand = 'teacher';
export type ClassroomExpand = 'tutor' | 'teachers' | 'students';

interface StudentListParams {
    search?: string;
    classroom_id?: number;
    expand?: StudentExpand[];
}

interface TeacherListParams {
    search?: string;
    level?: string;
    expand?: TeacherExpand[];
}

interface ParentListParams {
    search?: string;
    expand?: ParentExpand[];
}

interface UserListParams {
    search?: string;
    role?: string;
    status?: string;
    expand?: UserExpand[];
}

interface ClassroomListParams {
    search?: string;
    level?: string;
    shift?: string;
    fields?: 'minimal';
    expand?: ClassroomExpand[];
}

function appendToFormData(formData: FormData, data: Record<string, unknown>, prefix = ''): void {
    Object.entries(data).forEach(([key, value]) => {
        const fieldName = prefix ? `${prefix}[${key}]` : key;

        if (value === null || value === undefined) return;

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    appendToFormData(formData, item as Record<string, unknown>, `${fieldName}[${index}]`);
                } else {
                    formData.append(`${fieldName}[]`, String(item));
                }
            });
        } else if (typeof value === 'object' && !(value instanceof File)) {
            appendToFormData(formData, value as Record<string, unknown>, fieldName);
        } else if (value instanceof File) {
            formData.append(fieldName, value);
        } else {
            formData.append(fieldName, String(value));
        }
    });
}

export const usersService = {
    getStudents: async (params: StudentListParams = {}): Promise<Student[]> => {
        const queryParams = buildQueryParams(params);
        const response = await apiClient.get<ApiResponse<Student[]>>(`/students?${queryParams}`);
        return response.data.data;
    },

    getStudent: async (id: number, expand?: StudentExpand[]): Promise<Student> => {
        const queryParams = expand ? buildQueryParams({ expand }) : '';
        const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}${queryParams ? `?${queryParams}` : ''}`);
        return response.data.data;
    },

    createStudent: async (data: Partial<Student> & { photo?: File | null }): Promise<Student> => {
        const { photo, ...rest } = data;

        if (photo) {
            const formData = new FormData();
            appendToFormData(formData, rest);
            formData.append('photo', photo);

            const response = await apiClient.post<ApiResponse<Student>>('/students', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.data;
        }

        const response = await apiClient.post<ApiResponse<Student>>('/students', rest);
        return response.data.data;
    },

    updateStudent: async (id: number, data: StudentUpdateData): Promise<Student> => {
        const { photo, ...rest } = data;

        if (photo) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            appendToFormData(formData, rest);
            formData.append('photo', photo);

            const response = await apiClient.post<ApiResponse<Student>>(`/students/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.data;
        }

        const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, rest);
        return response.data.data;
    },

    deleteStudent: async (id: number): Promise<void> => {
        await apiClient.delete(`/students/${id}`);
    },

    getTeachers: async (params: TeacherListParams = {}): Promise<Teacher[]> => {
        const queryParams = buildQueryParams(params);
        const response = await apiClient.get<ApiResponse<Teacher[]>>(`/teachers?${queryParams}`);
        return response.data.data;
    },

    getTeacher: async (id: number, expand?: TeacherExpand[]): Promise<Teacher> => {
        const queryParams = expand ? buildQueryParams({ expand }) : '';
        const response = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}${queryParams ? `?${queryParams}` : ''}`);
        return response.data.data;
    },

    createTeacher: async (data: Partial<Teacher>): Promise<Teacher> => {
        const response = await apiClient.post<ApiResponse<Teacher>>('/teachers', data);
        return response.data.data;
    },

    updateTeacher: async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
        const response = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, data);
        return response.data.data;
    },

    deleteTeacher: async (id: number): Promise<void> => {
        await apiClient.delete(`/teachers/${id}`);
    },

    getParents: async (params: ParentListParams = {}): Promise<Parent[]> => {
        const queryParams = buildQueryParams(params);
        const response = await apiClient.get<ApiResponse<Parent[]>>(`/parents?${queryParams}`);
        return response.data.data;
    },

    getParent: async (id: number, expand?: ParentExpand[]): Promise<Parent> => {
        const queryParams = expand ? buildQueryParams({ expand }) : '';
        const response = await apiClient.get<ApiResponse<Parent>>(`/parents/${id}${queryParams ? `?${queryParams}` : ''}`);
        return response.data.data;
    },

    createParent: async (data: Partial<Parent>): Promise<Parent> => {
        const response = await apiClient.post<ApiResponse<Parent>>('/parents', data);
        return response.data.data;
    },

    updateParent: async (id: number, data: ParentUpdateData): Promise<Parent> => {
        const response = await apiClient.put<ApiResponse<Parent>>(`/parents/${id}`, data);
        return response.data.data;
    },

    deleteParent: async (id: number): Promise<void> => {
        await apiClient.delete(`/parents/${id}`);
    },

    getUsers: async (params: UserListParams = {}): Promise<User[]> => {
        const queryParams = buildQueryParams(params);
        const response = await apiClient.get<ApiResponse<User[]>>(`/users?${queryParams}`);
        return response.data.data;
    },

    getUser: async (id: number, expand?: UserExpand[]): Promise<User> => {
        const queryParams = expand ? buildQueryParams({ expand }) : '';
        const response = await apiClient.get<ApiResponse<User>>(`/users/${id}${queryParams ? `?${queryParams}` : ''}`);
        return response.data.data;
    },

    createUser: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.post<ApiResponse<User>>('/users', data);
        return response.data.data;
    },

    updateUser: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    getClassrooms: async (params: ClassroomListParams = {}): Promise<Classroom[]> => {
        const queryParams = buildQueryParams(params);
        const response = await apiClient.get<ApiResponse<Classroom[]>>(`/classrooms?${queryParams}`);
        return response.data.data;
    },

    getClassroom: async (id: number, expand?: ClassroomExpand[]): Promise<Classroom> => {
        const queryParams = expand ? buildQueryParams({ expand }) : '';
        const response = await apiClient.get<ApiResponse<Classroom>>(`/classrooms/${id}${queryParams ? `?${queryParams}` : ''}`);
        return response.data.data;
    },
};
