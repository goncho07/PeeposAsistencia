import api from '@/lib/axios';
import { useEffect, useRef } from 'react';

export const useCarnets = () => {
    const generatingRef = useRef(false);

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        if (generatingRef.current) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    };

    useEffect(() => {
        window.addEventListener('beforeunload', beforeUnloadHandler);
        return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
    }, []);

    const generateCarnet = async (payload: {
        type: 'student' | 'teacher' | 'all';
        level?: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
        grade?: number;
        section?: string;
    }) => {
        try {
            generatingRef.current = true;

            console.group('🧪 generateCarnet');
            console.log('payload:', payload);
            console.groupEnd();

            const response = await api.post('/carnets/generate', payload, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `carnets_${payload.type}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating carnet:', error);
            throw error;
        } finally {
            generatingRef.current = false;
        }
    };

    return { generateCarnet };
};
