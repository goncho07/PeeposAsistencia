import apiClient from '../axios';
import { ApiResponse } from './types';

export type AttendableType = 'student' | 'teacher' | 'user';

interface AttendableStats {
    total_registered: number;
    present: number;
    late: number;
    absent: number;
    justified?: number;
}

export interface DailyStats {
    date: string;
    allowed_types: AttendableType[];
    students?: AttendableStats;
    teachers?: AttendableStats;
    users?: AttendableStats;
}

export interface WeeklyDayStats {
    date: string;
    day_name: string;
    present: number;
    late: number;
    absent: number;
    justified: number;
}

export interface WeeklyStats {
    week_start: string;
    week_end: string;
    allowed_types: AttendableType[];
    days: WeeklyDayStats[];
}

export const attendanceService = {
    getDailyStats: async (): Promise<DailyStats> => {
        const response = await apiClient.get<ApiResponse<DailyStats>>('/attendance/daily-stats');
        return response.data.data;
    },

    getWeeklyStats: async (): Promise<WeeklyStats> => {
        const response = await apiClient.get<ApiResponse<WeeklyStats>>('/attendance/weekly-stats');
        return response.data.data;
    },
};