'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { CreditCard, Users, GraduationCap, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, FileDown, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseModal } from './BaseModal';
import { carnetsService, CarnetFilters, CarnetJob } from '@/lib/api/carnets';
import { usersService } from '@/lib/api/users';

interface CarnetGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (message: string) => void;
}

interface Classroom {
    id: number;
    full_name: string;
    level: string;
    grade: number;
    section: string;
    shift: string;
    status: string;
}

const POLL_INTERVAL = 1000;
const SUCCESS_DISPLAY_TIME = 3500;

export function CarnetGeneratorModal({ isOpen, onClose, onSuccess }: CarnetGeneratorModalProps) {
    const [filters, setFilters] = useState<CarnetFilters>({
        type: 'all',
        level: 'all',
        grade: 'all',
        section: 'all'
    });
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [job, setJob] = useState<CarnetJob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const successTimeout = useRef<NodeJS.Timeout | null>(null);
    const hasDownloaded = useRef(false);
    const isProcessing = useRef(false);

    useEffect(() => {
        if (isOpen) {
            fetchClassrooms();
            setShowSuccessScreen(false);
            hasDownloaded.current = false;
            isProcessing.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!job?.id) return;

        const isRunning = job.status === 'pending' || job.status === 'processing';

        if (isRunning && !pollingInterval.current && !hasDownloaded.current) {
            pollingInterval.current = setInterval(() => {
                if (!hasDownloaded.current) {
                    fetchJobStatus(job.id!);
                }
            }, POLL_INTERVAL);
        } else if (!isRunning || hasDownloaded.current) {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [job?.id, job?.status]);

    useEffect(() => {
        if (job?.status === 'pending' || job?.status === 'processing') {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = 'Hay una generación de carnets en progreso.';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [job?.status]);

    useEffect(() => {
        return () => {
            if (successTimeout.current) clearTimeout(successTimeout.current);
            stopPolling();
        };
    }, []);

    const fetchClassrooms = async () => {
        try {
            const data = await usersService.getClassrooms();
            setClassrooms(data || []);
        } catch (err) {
            console.error('Error fetching classrooms:', err);
        }
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    const fetchJobStatus = async (jobId: number) => {
        if (hasDownloaded.current || isProcessing.current) {
            return;
        }

        try {
            const status = await carnetsService.getStatus(jobId);

            if (hasDownloaded.current || isProcessing.current) {
                return;
            }

            setJob(status);

            if (status.status === 'completed') {
                hasDownloaded.current = true;
                isProcessing.current = true;
                stopPolling();
                await downloadAndShowSuccess(jobId);
            } else if (status.status === 'failed') {
                stopPolling();
                setError(status.error_message || 'Error al generar carnets');
            }
        } catch (err) {
            console.error('Error fetching job status:', err);
            stopPolling();
            setJob(null);
        }
    };

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            hasDownloaded.current = false;
            isProcessing.current = false;

            const response = await carnetsService.generate(filters);

            await fetchJobStatus(response.job_id);
            setIsGenerating(false);
        } catch (err: any) {
            console.error('Error generating carnets:', err);
            setError(err.response?.data?.message || 'Error al generar carnets');
            setIsGenerating(false);
        }
    };

    const downloadAndShowSuccess = async (jobId: number) => {
        try {
            setShowSuccessScreen(true);

            const blob = await carnetsService.download(jobId);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `carnets_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            if (onSuccess) onSuccess('Carnets descargados exitosamente');

            successTimeout.current = setTimeout(handleCloseModal, SUCCESS_DISPLAY_TIME);
        } catch (err) {
            console.error('Error downloading carnets:', err);
            setError('Error al descargar PDF');
            setShowSuccessScreen(false);
            hasDownloaded.current = false;
            isProcessing.current = false;
        }
    };

    const handleCloseModal = () => {
        setFilters({ type: 'all', level: 'all', grade: 'all', section: 'all' });
        setError(null);
        setJob(null);
        setShowSuccessScreen(false);
        hasDownloaded.current = false;
        isProcessing.current = false;
        if (successTimeout.current) {
            clearTimeout(successTimeout.current);
            successTimeout.current = null;
        }
        stopPolling();
        onClose();
    };

    const handleCloseAttempt = () => {
        if (job?.status === 'pending' || job?.status === 'processing') return;
        handleCloseModal();
    };

    const availableLevels = useMemo(() => {
        const levels = new Set(classrooms.map(c => c.level));
        return Array.from(levels).sort();
    }, [classrooms]);

    const availableGrades = useMemo(() => {
        if (filters.level === 'all') return [];
        const grades = new Set(
            classrooms
                .filter(c => c.level === filters.level)
                .map(c => c.grade)
        );
        return Array.from(grades).sort((a, b) => a - b);
    }, [classrooms, filters.level]);

    const availableSections = useMemo(() => {
        if (filters.level === 'all' || filters.grade === 'all') return [];
        const sections = new Set(
            classrooms
                .filter(c => c.level === filters.level && c.grade.toString() === filters.grade)
                .map(c => c.section)
        );
        return Array.from(sections).sort();
    }, [classrooms, filters.level, filters.grade]);

    const canGenerate = !isGenerating && (!job || job.status === 'completed' || job.status === 'failed');
    const isJobRunning = job?.status === 'pending' || job?.status === 'processing';

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleCloseAttempt}
            title="Generador de Carnets"
            size="md"
            showCloseButton={!isJobRunning && !showSuccessScreen}
        >
            <AnimatePresence mode="wait">
                {/* Success Screen */}
                {showSuccessScreen ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-16 px-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 360] }}
                            transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
                            className="mx-auto mb-8 w-32 h-32 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                            }}
                        >
                            <CheckCircle2 className="w-20 h-20" style={{ color: 'var(--color-success)' }} />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold mb-4"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ¡Carnets Generados!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg mb-8"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {job?.total_users} carnets descargados exitosamente
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-2 text-sm font-medium"
                            style={{ color: 'var(--color-success)' }}
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span>Descarga completada</span>
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                    >
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg flex items-center gap-2"
                                style={{
                                    backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)'
                                }}
                            >
                                <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
                            </motion.div>
                        )}

                        {/* Job Status */}
                        {job && (
                            <div>
                                {job.status === 'pending' && (
                                    <div className="card py-12">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <motion.div
                                                className="w-24 h-24 rounded-full flex items-center justify-center"
                                                style={{
                                                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                                                }}
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <CreditCard className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
                                            </motion.div>

                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                                    Preparando generación...
                                                </h3>
                                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Esto tomará solo unos segundos
                                                </p>
                                            </div>

                                            <div className="w-full max-w-md">
                                                <div className="progress-container">
                                                    <motion.div
                                                        className="progress-bar animate-pulse"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '15%' }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {job.status === 'processing' && (
                                    <div className="card py-12">
                                        <div className="flex flex-col items-center justify-center gap-6">
                                            <motion.div
                                                className="w-24 h-24 rounded-full flex items-center justify-center"
                                                style={{
                                                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                                                }}
                                            >
                                                <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--color-primary)' }} />
                                            </motion.div>

                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                                    Generando carnets...
                                                </h3>
                                                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Procesando {job.total_users} usuario{job.total_users !== 1 ? 's' : ''}
                                                </p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <FileDown className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                                                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-primary)' }}>
                                                        {job.progress}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full max-w-md">
                                                <div className="progress-container">
                                                    <motion.div
                                                        className="progress-bar"
                                                        animate={{ width: `${job.progress}%` }}
                                                        transition={{ duration: 0.2, ease: 'linear' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {job.status === 'failed' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                                            border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)'
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
                                                    Error al generar carnets
                                                </p>
                                                {job.error_message && (
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)', opacity: 0.8 }}>
                                                        {job.error_message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {!isJobRunning && (
                            <div className="detail-card">
                                <div className="space-y-4">
                                    <div className="detail-card-header">
                                        <GraduationCap className="w-5 h-5" />
                                        <h3>Tipo de Usuario</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'all', label: 'Todos', icon: Users },
                                            { value: 'student', label: 'Estudiantes', icon: Users },
                                            { value: 'teacher', label: 'Docentes', icon: GraduationCap }
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            const isActive = filters.type === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFilters({ ...filters, type: option.value as any, level: 'all', grade: 'all', section: 'all' })}
                                                    className="p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1"
                                                    style={{
                                                        borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                                                        backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent'
                                                    }}
                                                >
                                                <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                                                <span className="text-xs font-medium" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {filters.type !== 'all' && (
                                        <>
                                            <div className="form-group">
                                                <label className="label">Nivel</label>
                                                <select
                                                    value={filters.level}
                                                    onChange={(e) => setFilters({ ...filters, level: e.target.value, grade: 'all', section: 'all' })}
                                                    className="select"
                                                >
                                                    <option value="all">Todos los niveles</option>
                                                    {availableLevels.map(level => (
                                                        <option key={level} value={level}>
                                                            {level.charAt(0) + level.slice(1).toLowerCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {filters.type === 'student' && filters.level !== 'all' && (
                                                <>
                                                    <div className="form-group">
                                                        <label className="label">Grado</label>
                                                        <select
                                                            value={filters.grade}
                                                            onChange={(e) => setFilters({ ...filters, grade: e.target.value, section: 'all' })}
                                                            className="select"
                                                        >
                                                            <option value="all">Todos los grados</option>
                                                            {availableGrades.map(grade => (
                                                                <option key={grade} value={grade.toString()}>
                                                                    {filters.level === 'INICIAL' ? `${grade} años` : `${grade}°`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {filters.grade !== 'all' && (
                                                        <div className="form-group">
                                                            <label className="label">Sección</label>
                                                            <select
                                                                value={filters.section}
                                                                onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                                                                className="select"
                                                            >
                                                                <option value="all">Todas las secciones</option>
                                                                {availableSections.map(section => (
                                                                    <option key={section} value={section}>{section}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isJobRunning && (
                            <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseAttempt}
                                    disabled={isGenerating}
                                    className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)'
                                    }}
                                >
                                    Cerrar
                                </button>

                                {canGenerate && (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                                        style={{
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white'
                                        }}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Iniciando...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                Generar Carnets
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </BaseModal>
    );
}
