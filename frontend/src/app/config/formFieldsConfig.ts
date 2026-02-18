import { User, Mail, Phone, Hash, Calendar, Lock, GraduationCap, Users, BookOpen, Clock } from 'lucide-react';
import type { SelectOption } from '@/app/components/forms';

export const DOCUMENT_TYPES: SelectOption[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

export const GENDER_OPTIONS: SelectOption[] = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

export const ENROLLMENT_STATUS: SelectOption[] = [
  { value: 'MATRICULADO', label: 'Matriculado' },
  { value: 'RETIRADO', label: 'Retirado' },
  { value: 'TRASLADADO', label: 'Trasladado' },
];

export const EDUCATION_LEVELS: SelectOption[] = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
];

export const GRADE_OPTIONS: Record<string, SelectOption[]> = {
  INICIAL: [
    { value: '3', label: '3 años' },
    { value: '4', label: '4 años' },
    { value: '5', label: '5 años' },
  ],
  PRIMARIA: [
    { value: '1', label: '1°' },
    { value: '2', label: '2°' },
    { value: '3', label: '3°' },
    { value: '4', label: '4°' },
    { value: '5', label: '5°' },
    { value: '6', label: '6°' },
  ],
  SECUNDARIA: [
    { value: '1', label: '1°' },
    { value: '2', label: '2°' },
    { value: '3', label: '3°' },
    { value: '4', label: '4°' },
    { value: '5', label: '5°' },
  ],
};

export const SECTION_OPTIONS: SelectOption[] = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
];

export const SHIFT_OPTIONS: SelectOption[] = [
  { value: 'MAÑANA', label: 'Mañana' },
  { value: 'TARDE', label: 'Tarde' },
];

export const CLASSROOM_STATUS: SelectOption[] = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
];

export const RELATIONSHIP_TYPES: SelectOption[] = [
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'TUTOR', label: 'Tutor' },
  { value: 'ABUELO', label: 'Abuelo/a' },
  { value: 'TIO', label: 'Tío/a' },
  { value: 'HERMANO', label: 'Hermano/a' },
  { value: 'OTRO', label: 'Otro' },
];

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'APODERADO', label: 'Apoderado' },
  { value: 'ADMIN', label: 'Administrador' },
];

export const FIELD_ICONS = {
  user: User,
  mail: Mail,
  phone: Phone,
  hash: Hash,
  calendar: Calendar,
  lock: Lock,
  graduationCap: GraduationCap,
  users: Users,
  bookOpen: BookOpen,
  clock: Clock,
};

export const STUDENT_FIELDS = {
  studentCode: {
    name: 'student_code',
    label: 'Código de Estudiante',
    type: 'text' as const,
    icon: FIELD_ICONS.hash,
    placeholder: 'Ej: EST001',
    required: true,
  },
  name: {
    name: 'name',
    label: 'Nombres',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Nombres del estudiante',
    required: true,
  },
  paternalSurname: {
    name: 'paternal_surname',
    label: 'Apellido Paterno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido paterno',
    required: true,
  },
  maternalSurname: {
    name: 'maternal_surname',
    label: 'Apellido Materno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido materno',
    required: true,
  },
  documentType: {
    name: 'document_type',
    label: 'Tipo de Documento',
    icon: FIELD_ICONS.hash,
    options: DOCUMENT_TYPES,
    required: true,
  },
  documentNumber: {
    name: 'document_number',
    label: 'Número de Documento',
    type: 'text' as const,
    icon: FIELD_ICONS.hash,
    placeholder: 'Número de documento',
    required: true,
  },
  gender: {
    name: 'gender',
    label: 'Género',
    icon: FIELD_ICONS.user,
    options: GENDER_OPTIONS,
    required: true,
  },
  birthDate: {
    name: 'birth_date',
    label: 'Fecha de Nacimiento',
    type: 'date' as const,
    icon: FIELD_ICONS.calendar,
    required: true,
  },
  enrollmentStatus: {
    name: 'enrollment_status',
    label: 'Estado de Matrícula',
    icon: FIELD_ICONS.graduationCap,
    options: ENROLLMENT_STATUS,
    required: true,
  },
};

export const PARENT_FIELDS = {
  name: {
    name: 'name',
    label: 'Nombres',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Nombres del apoderado',
    required: true,
  },
  paternalSurname: {
    name: 'paternal_surname',
    label: 'Apellido Paterno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido paterno',
    required: true,
  },
  maternalSurname: {
    name: 'maternal_surname',
    label: 'Apellido Materno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido materno',
    required: true,
  },
  documentType: {
    name: 'document_type',
    label: 'Tipo de Documento',
    icon: FIELD_ICONS.hash,
    options: DOCUMENT_TYPES,
    required: true,
  },
  documentNumber: {
    name: 'document_number',
    label: 'Número de Documento',
    type: 'text' as const,
    icon: FIELD_ICONS.hash,
    placeholder: 'Número de documento',
    required: true,
  },
  phoneNumber: {
    name: 'phone_number',
    label: 'Teléfono',
    type: 'tel' as const,
    icon: FIELD_ICONS.phone,
    placeholder: '999999999',
    required: true,
  },
  email: {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email' as const,
    icon: FIELD_ICONS.mail,
    placeholder: 'correo@ejemplo.com',
    required: false,
  },
};

export const TEACHER_FIELDS = {
  name: {
    name: 'name',
    label: 'Nombres',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Nombres del docente',
    required: true,
  },
  paternalSurname: {
    name: 'paternal_surname',
    label: 'Apellido Paterno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido paterno',
    required: true,
  },
  maternalSurname: {
    name: 'maternal_surname',
    label: 'Apellido Materno',
    type: 'text' as const,
    icon: FIELD_ICONS.user,
    placeholder: 'Apellido materno',
    required: true,
  },
  documentType: {
    name: 'document_type',
    label: 'Tipo de Documento',
    icon: FIELD_ICONS.hash,
    options: DOCUMENT_TYPES,
    required: true,
  },
  documentNumber: {
    name: 'document_number',
    label: 'Número de Documento',
    type: 'text' as const,
    icon: FIELD_ICONS.hash,
    placeholder: 'Número de documento',
    required: true,
  },
  phoneNumber: {
    name: 'phone_number',
    label: 'Teléfono',
    type: 'tel' as const,
    icon: FIELD_ICONS.phone,
    placeholder: '999999999',
    required: true,
  },
  email: {
    name: 'email',
    label: 'Correo Electrónico',
    type: 'email' as const,
    icon: FIELD_ICONS.mail,
    placeholder: 'correo@ejemplo.com',
    required: false,
  },
  specialization: {
    name: 'specialization',
    label: 'Especialización',
    type: 'text' as const,
    icon: FIELD_ICONS.graduationCap,
    placeholder: 'Ej: Matemáticas',
    required: false,
  },
};

export const CLASSROOM_FIELDS = {
  level: {
    name: 'level',
    label: 'Nivel',
    icon: FIELD_ICONS.bookOpen,
    options: EDUCATION_LEVELS,
    required: true,
  },
  grade: {
    name: 'grade',
    label: 'Grado',
    icon: FIELD_ICONS.graduationCap,
    required: true,
  },
  section: {
    name: 'section',
    label: 'Sección',
    icon: FIELD_ICONS.users,
    options: SECTION_OPTIONS,
    required: true,
  },
  shift: {
    name: 'shift',
    label: 'Turno',
    icon: FIELD_ICONS.clock,
    options: SHIFT_OPTIONS,
    required: true,
  },
  status: {
    name: 'status',
    label: 'Estado',
    icon: FIELD_ICONS.hash,
    options: CLASSROOM_STATUS,
    required: true,
  },
};

export const VALIDATION_PATTERNS = {
  dni: /^\d{8}$/,
  phone: /^\d{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const ERROR_MESSAGES = {
  required: 'Este campo es requerido',
  invalidEmail: 'Correo electrónico inválido',
  invalidPhone: 'Teléfono debe tener 9 dígitos',
  invalidDNI: 'DNI debe tener 8 dígitos',
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  uniqueDocumentNumber: 'Este número de documento ya está registrado',
  uniqueStudentCode: 'Este código de estudiante ya existe',
  uniqueEmail: 'Este correo electrónico ya está registrado',
};

export const SUCCESS_MESSAGES = {
  created: (entity: string) => `${entity} creado exitosamente`,
  updated: (entity: string) => `${entity} actualizado exitosamente`,
  deleted: (entity: string) => `${entity} eliminado exitosamente`,
};

export const CONFIRMATION_MESSAGES = {
  delete: (entity: string) => `¿Está seguro de eliminar este ${entity.toLowerCase()}?`,
  deleteWarning: 'Esta acción no se puede deshacer',
};
