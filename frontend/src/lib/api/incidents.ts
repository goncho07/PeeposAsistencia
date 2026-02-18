import apiClient from '../axios';
import { ApiResponse, buildQueryParams } from './types';

export interface Incident {
  id: number;
  classroom_id: number;
  classroom: {
    id: number;
    full_name: string;
    level: string;
    grade: number;
    section: string;
    shift: string;
  };
  student_id: number;
  student: {
    id: number;
    full_name: string;
    document_number: string;
    photo_url: string | null;
  };
  reported_by: number;
  reporter: {
    id: number;
    full_name: string;
  };
  date: string;
  time: string;
  type: IncidentType;
  type_label: string;
  severity: IncidentSeverity;
  severity_label: string;
  description: string | null;
  created_at: string;
}

export type IncidentType =
  | 'USO_JOYAS'
  | 'UÑAS_PINTADAS'
  | 'CABELLO_SUELTO'
  | 'FALTA_ASEO_PERSONAL'
  | 'UNIFORME_INCOMPLETO'
  | 'NO_TRAJO_UTILes'
  | 'INCUMPLIMIENTO_TAREAS'
  | 'INDISCIPLINA_FORMACION'
  | 'INDISCIPLINA_AULA'
  | 'FALTA_RESPETO_SIMBOLOS_PATRIOS'
  | 'FALTA_RESPETO_DOCENTE'
  | 'AGRESION_VERBAL'
  | 'USO_CELULAR'
  | 'DAÑO_INFRAESTRUCTURA'
  | 'ESCANDALO_AULA'
  | 'SALIDA_NO_AUTORIZADA'
  | 'AGRESION_FISICA'
  | 'ACOSO_ESCOLAR'
  | 'CONSUMO_DROGAS'
  | 'PORTE_ARMAS';

export type IncidentSeverity = 'LEVE' | 'MODERADA' | 'GRAVE';

export interface IncidentFilters {
  classroom_id?: number;
  student_id?: number;
  type?: IncidentType;
  severity?: IncidentSeverity;
  date?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateIncidentData {
  classroom_id: number;
  student_id: number;
  type: IncidentType;
  description?: string;
}

export interface UpdateIncidentData {
  type?: IncidentType;
  severity?: IncidentSeverity;
  description?: string;
}

class IncidentsService {
  async getAll(filters?: IncidentFilters): Promise<Incident[]> {
    const queryParams = filters ? buildQueryParams(filters).toString() : '';
    const response = await apiClient.get<ApiResponse<Incident[]>>(`/incidents${queryParams ? `?${queryParams}` : ''}`);
    return response.data.data;
  }

  async getById(id: number): Promise<Incident> {
    const response = await apiClient.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return response.data.data;
  }

  async getByStudent(studentId: number): Promise<Incident[]> {
    const response = await apiClient.get<ApiResponse<Incident[]>>(`/incidents/student/${studentId}`);
    return response.data.data;
  }

  async create(data: CreateIncidentData): Promise<Incident> {
    const response = await apiClient.post<ApiResponse<Incident>>('/incidents', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateIncidentData): Promise<Incident> {
    const response = await apiClient.put<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/incidents/${id}`);
  }
}

export const incidentsService = new IncidentsService();

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  USO_JOYAS: 'Uso de joyas',
  UÑAS_PINTADAS: 'Uñas pintadas',
  CABELLO_SUELTO: 'Cabello suelto',
  FALTA_ASEO_PERSONAL: 'Falta de aseo personal',
  UNIFORME_INCOMPLETO: 'Uniforme incompleto',
  NO_TRAJO_UTILes: 'No trajo útiles',
  INCUMPLIMIENTO_TAREAS: 'Incumplimiento de tareas',
  INDISCIPLINA_FORMACION: 'Indisciplina en formación',
  INDISCIPLINA_AULA: 'Indisciplina en aula',
  FALTA_RESPETO_SIMBOLOS_PATRIOS: 'Falta de respeto a símbolos patrios',
  FALTA_RESPETO_DOCENTE: 'Falta de respeto al docente',
  AGRESION_VERBAL: 'Agresión verbal',
  USO_CELULAR: 'Uso de celular',
  DAÑO_INFRAESTRUCTURA: 'Daño a infraestructura',
  ESCANDALO_AULA: 'Escándalo en aula',
  SALIDA_NO_AUTORIZADA: 'Salida no autorizada',
  AGRESION_FISICA: 'Agresión física',
  ACOSO_ESCOLAR: 'Acoso escolar',
  CONSUMO_DROGAS: 'Consumo de drogas',
  PORTE_ARMAS: 'Porte de armas',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LEVE: 'Leve',
  MODERADA: 'Moderada',
  GRAVE: 'Grave',
};
