export interface SystemConfig {
  loginBg: string;
  schoolLogo: string;
  sidebarLogo: string;
}

export interface Alert {
  id: number;
  type: 'critical' | 'important' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  status: 'new' | 'seen' | 'resolved';
  section?: string;
  details?: string;
  students?: string[];
}

export interface UserProfile {
  id: number;
  type: 'Estudiante' | 'Docente' | 'Administrativo' | 'Apoderado';
  name: string;
  dni: string;
  avatarGradient: string;
  roleOrGrade: string;
  email?: string;
  phone?: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  address?: string;
  district?: string;
  age?: number;
  guardian?: string;
  guardianPhone?: string;
  section?: string;
  level?: string;
  shift?: string;
  academicLocation?: string;
  grade?: string;
}

export interface Student {
  id: number;
  name: string;
  grade: string;
  dni: string;
  timeIn: string;
  timeOut: string;
  status: 'Presente' | 'Tardanza' | 'Ausente';
  avatarColor?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface Notification {
  id: number;
  title: string;
  time: string;
  type: 'alert' | 'info' | 'success' | 'warning';
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export type EducationalLevel = 'Inicial' | 'Primaria' | 'Secundaria';

export type EducationalStructure = {
  [key in EducationalLevel]: {
    grades: string[];
    sections: string[];
  };
};
