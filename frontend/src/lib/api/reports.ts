import apiClient from '../axios';

export interface ReportFilters {
    period: 'daily' | 'monthly' | 'bimester';
    type: 'student' | 'teacher';
    from?: string;
    to?: string;
    bimester?: number;
    level?: string;
    grade?: number;
    section?: string;
    shift?: string;
}

export interface AttendanceRecord {
    date: string;
    entry_time: string | null;
    exit_time: string | null;
    entry_status: string;
    exit_status: string | null;
}

export interface PersonDetail {
    id: number;
    name: string;
    type: string;
    document: string;
    statistics: {
        total_days: number;
        present: number;
        late: number;
        absent: number;
        justified: number;
    };
    records: AttendanceRecord[];
}

export interface ReportData {
    period: {
        from: string;
        to: string;
        type: string;
    };
    filters: ReportFilters;
    statistics: {
        total_records: number;
        present: number;
        late: number;
        absent: number;
        justified_absences: number;
        early_exits: number;
        justified_early_exits: number;
    };
    details: PersonDetail[];
}

class ReportsService {
    async generateReport(filters: ReportFilters): Promise<ReportData> {
        const response = await apiClient.post('/attendance/report', filters);
        return response.data.data;
    }
}

export const reportsService = new ReportsService();
