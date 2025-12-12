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

export type UserType = 'admin' | 'student' | 'teacher' | 'parent';

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'date' | 'select';
    required: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    maxLength?: number;
    gridCol?: 1 | 2 | 3;
    requiredOnUpdate?: boolean;
}

export const COMMON_FIELDS: FieldConfig[] = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre', gridCol: 1 },
    { name: 'paternal_surname', label: 'Apellido Paterno', type: 'text', required: true, placeholder: 'Apellido Paterno', gridCol: 1 },
    { name: 'maternal_surname', label: 'Apellido Materno', type: 'text', required: true, placeholder: 'Apellido Materno', gridCol: 1 }
];

export const FIELD_CONFIGS: Record<UserType, FieldConfig[]> = {
    admin: [
        { name: 'dni', label: 'DNI', type: 'text', required: true, placeholder: '12345678', maxLength: 8, gridCol: 2 },
        { name: 'rol', label: 'Rol', type: 'select', required: true, options: ADMIN_ROLES, gridCol: 2 },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'correo@ejemplo.com', gridCol: 2 },
        {
            name: 'password',
            label: 'Contraseña',
            type: 'password',
            required: true,
            requiredOnUpdate: false,
            placeholder: 'Dejar vacío para mantener la actual',
            gridCol: 2
        },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', gridCol: 1 }
    ],
    student: [
        { name: 'document_type', label: 'Tipo de Documento', type: 'select', required: true, options: DOCUMENT_TYPES, gridCol: 2 },
        { name: 'document_number', label: 'Número de Documento', type: 'text', required: true, placeholder: '12345678', gridCol: 2 },
        { name: 'student_code', label: 'Código de Estudiante', type: 'text', required: true, placeholder: '00000123456789', maxLength: 14, gridCol: 2 },
        { name: 'gender', label: 'Género', type: 'select', required: true, options: GENDER_OPTIONS, gridCol: 2 },
        { name: 'date_of_birth', label: 'Fecha de Nacimiento', type: 'date', required: true, gridCol: 2 },
        { name: 'padre_id', label: 'Apoderado (Opcional)', type: 'select', required: false, options: [], gridCol: 2 }
    ],
    teacher: [
        { name: 'dni', label: 'DNI', type: 'text', required: true, placeholder: '12345678', maxLength: 8, gridCol: 2 },
        { name: 'area', label: 'Área', type: 'text', required: true, placeholder: 'Matemática, Comunicación, etc.', gridCol: 2 },
        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'correo@ejemplo.com', gridCol: 2 },
        { name: 'level', label: 'Nivel', type: 'select', required: true, options: [], gridCol: 2 },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', gridCol: 2 }
    ],
    parent: [
        { name: 'document_type', label: 'Tipo de Documento', type: 'select', required: true, options: DOCUMENT_TYPES, gridCol: 2 },
        { name: 'document_number', label: 'Número de Documento', type: 'text', required: true, placeholder: '12345678', gridCol: 2 },
        { name: 'relationship_type', label: 'Tipo de Relación', type: 'select', required: true, options: RELATIONSHIP_TYPES, gridCol: 3 },
        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'correo@ejemplo.com', gridCol: 3 },
        { name: 'phone_number', label: 'Teléfono', type: 'text', required: false, placeholder: '987654321', gridCol: 3 }
    ]
};

export const API_ENDPOINTS: Record<UserType, string> = {
    admin: '/users/admin',
    student: '/users/student',
    teacher: '/users/teacher',
    parent: '/users/parent'
};