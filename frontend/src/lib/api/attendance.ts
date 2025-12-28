import apiClient from '../axios';

export interface DailyStats {
    date: string;
    students: {
        total_registered: number;
        present: number;
        late: number;
        absent: number;
        justified: number;
    };
    teachers: {
        total_registered: number;
        present: number;
        late: number;
        absent: number;
    };
    notifications_sent: number;
}

export const attendanceService = {
    getDailyStats: async (): Promise<DailyStats> => {
        const response = await apiClient.get('/attendance/daily-stats');
    
        return response.data.data;
    },
};