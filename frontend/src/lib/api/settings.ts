import axios from '../axios';
import { ApiResponse } from './types';
import type { AttendableType } from './attendance';

export interface Settings {
  general: {
    attendable_types: AttendableType[];
    attendance_days: string[];
    tardiness_tolerance_minutes: number;
    timezone: string;
    auto_mark_absences: boolean;
    auto_mark_absences_time: string;
  };
  horarios: {
    [key: string]: string;
  };
  whatsapp: {
    waha_inicial_port: number;
    waha_primaria_port: number;
    waha_secundaria_port: number;
    whatsapp_notifications_enabled: boolean;
    whatsapp_send_on_entry: boolean;
    whatsapp_send_on_exit: boolean;
    whatsapp_send_on_absence: boolean;
  };
}

class SettingsService {
  async getAll(): Promise<Settings> {
    const response = await axios.get<ApiResponse<Settings>>('/settings');
    return response.data.data;
  }

  async getAttendableTypes(): Promise<AttendableType[]> {
    const response = await axios.get<ApiResponse<AttendableType[]>>('/settings/attendable-types');
    return response.data.data;
  }

  async update(settings: Partial<Settings>): Promise<void> {
    const flattenedSettings: Record<string, unknown> = {};

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
