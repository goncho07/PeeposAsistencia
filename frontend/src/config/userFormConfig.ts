import { DynamicField } from "@/components/modals/DynamicFormModal";

export const DOCUMENT_TYPES = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'CE' },
    { value: 'PAS', label: 'PAS' },
    { value: 'CI', label: 'CI' },
    { value: 'PTP', label: 'PTP' }
];

export const ADMIN_ROLES = [
    { value: 'DIRECTOR', label: 'DIRECTOR' },
    { value: 'SUBDIRECTOR', label: 'SUBDIRECTOR' },
    { value: 'SECRETARIO', label: 'SECRETARIO' },
    { value: 'ESCANER', label: 'ESCANER' }
];

export const RELATIONSHIP_TYPES = [
    { value: 'PADRE', label: 'PADRE' },
    { value: 'MADRE', label: 'MADRE' },
    { value: 'APODERADO', label: 'APODERADO' },
    { value: 'TUTOR', label: 'TUTOR' }
];

export const GENDER_OPTIONS = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
];

export const COMMON_FIELDS: DynamicField[] = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre', grid: 3 },
    { name: 'paternal_surname', label: 'Apellido Paterno', type: 'text', required: true, placeholder: 'Apellido Paterno', grid: 3 },
    { name: 'maternal_surname', label: 'Apellido Materno', type: 'text', required: true, placeholder: 'Apellido Materno', grid: 3 }
];

export const FIELD_CONFIGS: Record<UserType, DynamicField[]> = {
    student: [
        { name: 'document_type', label: 'Tipo de Documento', type: 'select', required: true, defaultValue: 'DNI', options: DOCUMENT_TYPES, grid: 2 },
        { name: 'document_number', label: 'Número de Documento', type: 'text', required: true, placeholder: '12345678', grid: 2 },
        { name: 'student_code', label: 'Código de Estudiante', type: 'text', required: true, placeholder: '00000123456789', maxLength: 14, grid: 2 },
        { name: 'gender', label: 'Género', type: 'select', required: true, defaultValue: 'M', options: GENDER_OPTIONS, grid: 2 },
        { name: 'date_of_birth', label: 'Fecha de Nacimiento', type: 'date', required: true, grid: 2 },
        { name: 'padre_id', label: 'Apoderado (Opcional)', type: 'select', required: false, options: [], grid: 2 },
        { name: 'level', label: 'Nivel', type: 'select', required: true, options: [], grid: 2, isAcademic: true },
        { name: 'grade', label: 'Grado', type: 'select', required: true, options: [], grid: 2, isAcademic: true },
        { name: 'section', label: 'Sección', type: 'select', required: true, options: [], grid: 2, isAcademic: true },
    ],
    teacher: [
        { name: 'dni', label: 'DNI', type: 'text', required: true, placeholder: '12345678', maxLength: 8, grid: 2 },
        { name: 'area', label: 'Área', type: 'text', required: true, placeholder: 'Matemática, Comunicación, etc.', grid: 2 },
        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'correo@ejemplo.com', grid: 2 },
        { name: 'level', label: 'Nivel', type: 'select', required: true, options: [], grid: 2 },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', grid: 2 }
    ],
    admin: [
        { name: 'dni', label: 'DNI', type: 'text', required: true, placeholder: '12345678', maxLength: 8, grid: 2 },
        { name: 'rol', label: 'Rol', type: 'select', required: true, options: ADMIN_ROLES, grid: 2 },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'correo@ejemplo.com', grid: 2 },
        { name: 'password', label: 'Contraseña', type: 'password', required: true, placeholder: 'Dejar vacío para mantener la actual', grid: 2 },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', grid: 1 }
    ],
    parent: [
        { name: 'document_type', label: 'Tipo de Documento', type: 'select', required: true, defaultValue: 'DNI', options: DOCUMENT_TYPES, grid: 2 },
        { name: 'document_number', label: 'Número de Documento', type: 'text', required: true, placeholder: '12345678', grid: 2 },
        { name: 'relationship_type', label: 'Tipo de Relación', type: 'select', required: true, options: RELATIONSHIP_TYPES, grid: 3 },
        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'correo@ejemplo.com', grid: 3 },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', grid: 3 }
    ]
};

export type UserType = 'admin' | 'student' | 'teacher' | 'parent';

export const USER_TYPES: { value: UserType; label: string }[] = [
    { value: 'student', label: 'Estudiante' },
    { value: 'teacher', label: 'Docente' },
    { value: 'admin', label: 'Administrativo' },
    { value: 'parent', label: 'Apoderado' },
];