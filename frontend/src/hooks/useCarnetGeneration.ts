import { useState } from 'react';
import api from '@/lib/axios';

interface UserToGenerate {
    id: number;
    type: 'student' | 'teacher';
}

interface GenerationProgress {
    current: number;
    total: number;
}

export const useCarnetGeneration = () => {
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress>({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);

    const generateCarnets = async (users: UserToGenerate[]) => {
        try {
            setGenerating(true);
            setError(null);
            setProgress({ current: 0, total: users.length });

            const response = await api.post('/carnets/generate',
                {
                    type: 'teacher',   // all | student | teacher
        },
                {
                    responseType: 'blob',
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setProgress({
                                current: Math.floor((percentCompleted / 100) * users.length),
                                total: users.length
                            });
                        }
                    }
                }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `carnets_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setProgress({ current: users.length, total: users.length });
        } catch (err: any) {
            console.error('Error generating carnets:', err);
            setError(err.response?.data?.message || 'Error al generar carnets');
            throw err;
        } finally {
            setGenerating(false);
        }
    };

    return {
        generating,
        progress,
        error,
        generateCarnets
    };
};