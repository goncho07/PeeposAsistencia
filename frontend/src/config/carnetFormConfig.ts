import { DynamicField } from "@/components/modals/DynamicFormModal";

export const FIELD_CONFIGS: Record<CarnetUserType, DynamicField[]> = {
    student: [
        { name: 'level', label: 'Nivel', type: 'select', required: true, options: [{ value: 'all', label: 'Todos' }], grid: 1 },
        { name: 'grade', label: 'Grado', type: 'select', required: true, options: [{ value: 'all', label: 'Todos' }], grid: 1 },
        { name: 'section', label: 'Sección', type: 'select', required: true, options: [{ value: 'all', label: 'Todos' }], grid: 1 },
    ],
    teacher: [
        { name: 'level', label: 'Nivel', type: 'select', required: true, options: [{ label: 'Todos', value: 'all' }], grid: 1 },
    ],
    all: []
};

export type CarnetUserType = 'student' | 'teacher' | 'all';

export const CARNET_USER_TYPES: { value: CarnetUserType; label: string }[] = [
    { value: 'student', label: 'Estudiante' },
    { value: 'teacher', label: 'Docente' },
    { value: 'all', label: 'Todos' },
];