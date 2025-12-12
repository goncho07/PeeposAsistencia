export interface AulaData {
    id: number;
    code: string;
    full_name: string;
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    grade: number;
    section: string;
    docente?: {
        id: number;
        full_name: string;
    };
    student_count: number;
}

export interface AdminData {
    id: number;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    email: string;
    dni: string;
    phone_number: string | null;
    rol: string;
    status: string;
    avatar_url: string | null;
}

export interface EstudianteData {
    id: number;
    student_code: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    document_type: string;
    document_number: string;
    gender: string;
    date_of_birth: string;
    age: number;
    qr_code: string;
    aula: AulaData | null;
    padre: {
        id: number;
        full_name: string;
        phone_number: string | null;
    } | null;
}

export interface DocenteData {
    id: number;
    dni: string;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    email: string;
    phone_number: string | null;
    area: string;
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    aulas_tutorizadas: AulaData[];
}

export interface PadreData {
    id: number;
    full_name: string;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    document_type: string;
    document_number: string;
    email: string;
    phone_number: string | null;
    relationship_type: string;
    children: Array<{
        id: number;
        full_name: string;
        student_code: string;
        aula: AulaData | null;
    }>;
}

export interface ApiUserResponse {
    type: 'admin' | 'student' | 'teacher' | 'parent';
    data: AdminData | EstudianteData | DocenteData | PadreData;
}

interface BaseUserProfile {
    id: number;
    fullName: string;
    dni: string;
    email: string;
    phone?: string;
    status: 'ACTIVO' | 'INACTIVO' | 'Suspendido';
    avatarGradient: string;
    avatarUrl?: string;
    headerLabel: string;
    rawData?: any;
}

export interface AdminProfile extends BaseUserProfile {
    type: 'Administrativo';
    rol: string;
}

export interface StudentProfile extends BaseUserProfile {
    type: 'Estudiante';
    studentCode: string;
    edad: number;
    gender: string;
    dateOfBirth: string;
    qrCode: string;
    section: string;
    level?: string;
    grade?: string;
    aulaInfo: {
        id: number;
        code: string;
        fullName: string;
        level: string;
        grade: number;
        section: string;
        docente?: {
            id: number;
            fullName: string;
        };
        studentCount: number;
    } | null;
    padreInfo: {
        id: number;
        fullName: string;
        phoneNumber: string | null;
    } | null;
}

export interface TeacherProfile extends BaseUserProfile {
    type: 'Docente';
    area: string;
    level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
    aulasTutorizadas: Array<{
        id: number;
        code: string;
        fullName: string;
    }>;
}

export interface ParentProfile extends BaseUserProfile {
    type: 'Apoderado';
    relationshipType: string;
    children: Array<{
        id: number;
        fullName: string;
        studentCode: string;
        aula: string;
    }>;
}

export type UserProfile =
    | AdminProfile
    | StudentProfile
    | TeacherProfile
    | ParentProfile;

export const isStudent = (user: UserProfile): user is StudentProfile =>
    user.type === 'Estudiante';

export const isTeacher = (user: UserProfile): user is TeacherProfile =>
    user.type === 'Docente';

export const isAdmin = (user: UserProfile): user is AdminProfile =>
    user.type === 'Administrativo';

export const isParent = (user: UserProfile): user is ParentProfile =>
    user.type === 'Apoderado';
