import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    CarnetFilters,
    carnetsService,
    SSEProgressEvent,
    SSEStartEvent,
    SSECompletedEvent,
    SSEErrorEvent,
} from '@/lib/api/carnets';
import { Classroom } from '@/lib/api/users';
import { settingsService } from '@/lib/api/settings';
import type { AttendableType } from '@/lib/api/attendance';

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

const SUCCESS_DISPLAY_TIME = 3500;

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function useCarnetGenerator(
    isOpen: boolean,
    classrooms: Classroom[],
    onSuccess?: (message: string) => void,
    onClose?: () => void
) {
    const [filters, setFilters] = useState<CarnetFilters>({
        type: 'all',
        level: 'all',
        grade: 'all',
        section: 'all',
    });
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [allowedTypes, setAllowedTypes] = useState<AttendableType[]>(['student']);

    const abortControllerRef = useRef<AbortController | null>(null);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            resetState();
            settingsService.getAttendableTypes().then((types) => {
                setAllowedTypes(types ?? ['student']);
            }).catch(() => {});
        }

        return () => {
            cleanup();
        };
    }, [isOpen]);

    useEffect(() => {
        if (status === 'generating') {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = 'Hay una generación de carnets en progreso.';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [status]);

    const resetState = () => {
        setStatus('idle');
        setProgress(0);
        setTotalUsers(0);
        setError(null);
        setFilters({ type: 'all', level: 'all', grade: 'all', section: 'all' });
    };

    const cleanup = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
            successTimeoutRef.current = null;
        }
    };

    const handleGenerate = useCallback(async () => {
        cleanup();
        setStatus('generating');
        setProgress(0);
        setError(null);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

            const payload = {
                ...filters,
                grade: filters.grade?.toString(),
            };

            const response = await fetch(`${baseUrl}/carnets/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify(payload),
                credentials: 'include',
                signal: abortController.signal,
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        errorMessage = Object.values(errorData.errors).flat().join(', ');
                    }
                } catch {
                    //
                }
                throw new Error(errorMessage);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let currentEvent = '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                        continue;
                    }

                    if (line.startsWith('data:')) {
                        const dataStr = line.slice(5).trim();
                        if (!dataStr) continue;

                        try {
                            const data = JSON.parse(dataStr);
                            handleSSEEvent(currentEvent, data);
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Request aborted');
                return;
            }

            console.error('Error generating carnets:', err);
            setError(err.message || 'Error al generar carnets');
            setStatus('error');
        }
    }, [filters]);

    const handleSSEEvent = (eventType: string, data: any) => {
        switch (eventType) {
            case 'start': {
                const startData = data as SSEStartEvent;
                setTotalUsers(startData.total_users);
                break;
            }
            case 'progress': {
                const progressData = data as SSEProgressEvent;
                setProgress(progressData.progress);
                break;
            }
            case 'completed': {
                const completedData = data as SSECompletedEvent;
                setStatus('completed');
                downloadPDF(completedData.pdf_path);
                break;
            }
            case 'error': {
                const errorData = data as SSEErrorEvent;
                setError(errorData.message);
                setStatus('error');
                break;
            }
        }
    };

    const downloadPDF = async (path: string) => {
        try {
            const blob = await carnetsService.download(path);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `carnets_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            if (onSuccess) {
                onSuccess('Carnets descargados exitosamente');
            }

            successTimeoutRef.current = setTimeout(() => {
                handleCloseModal();
            }, SUCCESS_DISPLAY_TIME);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            setError('Error al descargar PDF');
            setStatus('error');
        }
    };

    const handleCloseModal = useCallback(() => {
        cleanup();
        resetState();
        if (onClose) onClose();
    }, [onClose]);

    const handleCloseAttempt = useCallback(() => {
        if (status === 'generating') return;
        handleCloseModal();
    }, [status, handleCloseModal]);

    const availableLevels = useMemo(() => {
        const levels = new Set(classrooms.map((c) => c.level));
        return Array.from(levels).sort();
    }, [classrooms]);

    const availableGrades = useMemo(() => {
        if (filters.level === 'all') return [];
        const grades = new Set(
            classrooms.filter((c) => c.level === filters.level).map((c) => c.grade)
        );
        return Array.from(grades).sort((a, b) => a - b);
    }, [classrooms, filters.level]);

    const availableSections = useMemo(() => {
        if (!filters.grade || filters.level === 'all' || filters.grade === 'all') return [];

        const gradeNumber = parseInt(filters.grade, 10);
        const sections = new Set(
            classrooms
                .filter(
                    (c) =>
                        c.level === filters.level && c.grade === gradeNumber
                )
                .map((c) => c.section)
        );
        return Array.from(sections).sort();
    }, [classrooms, filters.level, filters.grade]);

    const canGenerate = status === 'idle' || status === 'error';
    const isGenerating = status === 'generating';
    const showSuccessScreen = status === 'completed';
    const isJobRunning = status === 'generating';

    return {
        filters,
        setFilters,
        progress,
        totalUsers,
        error,
        isGenerating,
        showSuccessScreen,
        allowedTypes,
        availableLevels,
        availableGrades,
        availableSections,
        canGenerate,
        isJobRunning,
        handleGenerate,
        handleCloseAttempt,
    };
}
