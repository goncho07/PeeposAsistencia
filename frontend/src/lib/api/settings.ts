import axios from '../axios';

export interface Settings {
  general: {
    attendance_days: string[];
    tardiness_tolerance_minutes: number;
    timezone: string;
    auto_mark_absences: boolean;
    auto_mark_absences_time: string;
  };
  horarios: {
    [key: string]: string; // horario_{level}_{shift}_{type}
  };
  whatsapp: {
    whatsapp_inicial_phone: string;
    whatsapp_primaria_phone: string;
    whatsapp_secundaria_phone: string;
    whatsapp_notifications_enabled: boolean;
    whatsapp_send_on_entry: boolean;
    whatsapp_send_on_exit: boolean;
    whatsapp_send_on_absence: boolean;
  };
  bimestres: {
    bimestre_1_inicio: string;
    bimestre_1_fin: string;
    bimestre_2_inicio: string;
    bimestre_2_fin: string;
    bimestre_3_inicio: string;
    bimestre_3_fin: string;
    bimestre_4_inicio: string;
    bimestre_4_fin: string;
  };
}

class SettingsService {
  async getAll(): Promise<Settings> {
    const response = await axios.get('/settings');
    return response.data;
  }

  async update(settings: Partial<Settings>): Promise<void> {
    // Flatten the nested structure for the backend
    const flattenedSettings: any = {};

    Object.entries(settings).forEach(([_, values]) => {
      if (typeof values === 'object' && values !== null) {
        Object.entries(values).forEach(([key, value]) => {
          flattenedSettings[key] = value;
        });
      }
    });

    await axios.put('/settings', { settings: flattenedSettings });
  }
}

export const settingsService = new SettingsService();
