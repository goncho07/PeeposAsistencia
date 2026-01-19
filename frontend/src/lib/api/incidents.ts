import apiClient from '../axios';

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
  status: IncidentStatus;
  status_label: string;
  resolution_notes: string | null;
  resolved_by: number | null;
  resolver: {
    id: number;
    full_name: string;
  } | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type IncidentType =
  | 'USO_CELULAR'
  | 'INTERRUPCION'
  | 'FALTA_RESPETO'
  | 'INCUMPLIMIENTO_TAREA'
  | 'UNIFORME_INCOMPLETO'
  | 'LLEGADA_TARDE'
  | 'DETERIORO_MATERIAL'
  | 'PELEA'
  | 'ACOSO'
  | 'SALIDA_NO_AUTORIZADA'
  | 'OTRO';

export type IncidentSeverity = 'LEVE' | 'MODERADA' | 'GRAVE';

export type IncidentStatus = 'REGISTRADA' | 'EN_SEGUIMIENTO' | 'RESUELTA';

export interface IncidentFilters {
  classroom_id?: number;
  student_id?: number;
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  date?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateIncidentData {
  classroom_id: number;
  student_id: number;
  date: string;
  time: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description?: string;
}

export interface UpdateIncidentData {
  type?: IncidentType;
  severity?: IncidentSeverity;
  description?: string;
  status?: IncidentStatus;
  resolution_notes?: string;
}

export interface IncidentStatistics {
  total: number;
  by_severity: {
    LEVE: number;
    MODERADA: number;
    GRAVE: number;
  };
  by_status: {
    REGISTRADA: number;
    EN_SEGUIMIENTO: number;
    RESUELTA: number;
  };
  by_type: Record<IncidentType, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class IncidentsService {
  async getAll(filters?: IncidentFilters): Promise<PaginatedResponse<Incident>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/incidents?${params.toString()}`);
    return response.data.data;
  }

  async getById(id: number): Promise<Incident> {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data.data;
  }

  async getByStudent(studentId: number): Promise<Incident[]> {
    const response = await apiClient.get(`/incidents/student/${studentId}`);
    return response.data.data;
  }

  async create(data: CreateIncidentData): Promise<Incident> {
    const response = await apiClient.post('/incidents', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateIncidentData): Promise<Incident> {
    const response = await apiClient.put(`/incidents/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/incidents/${id}`);
  }

  async getTypes(): Promise<Record<IncidentType, string>> {
    const response = await apiClient.get('/incidents/types');
    return response.data.data;
  }

  async getSeverities(): Promise<Record<IncidentSeverity, string>> {
    const response = await apiClient.get('/incidents/severities');
    return response.data.data;
  }

  async getStatistics(filters?: Pick<IncidentFilters, 'classroom_id' | 'date_from' | 'date_to'>): Promise<IncidentStatistics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/incidents/statistics?${params.toString()}`);
    return response.data.data;
  }
}

export const incidentsService = new IncidentsService();

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  USO_CELULAR: 'Uso de celular en clase',
  INTERRUPCION: 'Interrupción/bulla en clase',
  FALTA_RESPETO: 'Falta de respeto',
  INCUMPLIMIENTO_TAREA: 'No presentó tarea/material',
  UNIFORME_INCOMPLETO: 'Uniforme incompleto',
  LLEGADA_TARDE: 'Llegada tarde a clase',
  DETERIORO_MATERIAL: 'Deterioro de material/mobiliario',
  PELEA: 'Pelea o agresión física',
  ACOSO: 'Acoso o bullying',
  SALIDA_NO_AUTORIZADA: 'Salida del aula sin permiso',
  OTRO: 'Otro',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  LEVE: 'Leve',
  MODERADA: 'Moderada',
  GRAVE: 'Grave',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  REGISTRADA: 'Registrada',
  EN_SEGUIMIENTO: 'En seguimiento',
  RESUELTA: 'Resuelta',
};
