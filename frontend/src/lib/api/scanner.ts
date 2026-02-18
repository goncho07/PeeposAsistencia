import api from '../axios';
import { ApiResponse } from './types';

export type DeviceType = 'SCANNER' | 'MANUAL' | 'CAMARA' | 'APP';

export interface ScanResponse {
    success: boolean;
    message: string;
    attendance: {
        id: number;
        entry_time?: string;
        exit_time?: string;
        entry_status?: string;
        exit_status?: string;
    };
    person: {
        id: number;
        full_name: string;
        type: string;
    };
}

export const scannerService = {
    async scanEntry(qrCode: string, deviceType: DeviceType): Promise<ScanResponse> {
        const response = await api.post<ApiResponse<ScanResponse>>('/scanner/entry', {
            qr_code: qrCode,
            device_type: deviceType,
        });
        return response.data.data;
    },

    async scanExit(qrCode: string, deviceType: DeviceType): Promise<ScanResponse> {
        const response = await api.post<ApiResponse<ScanResponse>>('/scanner/exit', {
            qr_code: qrCode,
            device_type: deviceType,
        });
        return response.data.data;
    }
};
