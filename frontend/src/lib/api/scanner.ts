import api from '../axios';

export interface ScanResponse {
    success: boolean;
    message: string;
    attendance: {
        id: number;
        date: string;
        shift: string;
        entry_time?: string;
        exit_time?: string;
        entry_status?: string;
        exit_status?: string;
        whatsapp_sent: boolean;
    };
    person: {
        id: number;
        full_name: string;
        photo_url?: string;
        qr_code: string;
    };
}

export const scannerService = {
    async scanEntry(qrCode: string): Promise<ScanResponse> {
        const response = await api.post<{ data: ScanResponse }>('/scanner/entry', {
            qr_code: qrCode
        });
        return response.data.data;
    },

    async scanExit(qrCode: string): Promise<ScanResponse> {
        const response = await api.post<{ data: ScanResponse }>('/scanner/exit', {
            qr_code: qrCode
        });
        return response.data.data;
    }
};