'use client';
import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { Entity, EntityType } from '@/lib/api/users';
import { AlertTriangle } from 'lucide-react';

interface UserDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    entity: Entity | null;
    entityType: EntityType;
}

export function UserDeleteModal({ isOpen, onClose, onConfirm, entity, entityType }: UserDeleteModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!entity) return null;

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            await onConfirm();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const getEntityLabel = () => {
        const labels: Record<EntityType, string> = {
            student: 'estudiante',
            teacher: 'docente',
            parent: 'apoderado',
            user: 'usuario',
        };
        return labels[entityType];
    };

    const getWarningMessage = () => {
        if (entityType === 'student') {
            return 'Al eliminar este estudiante, se eliminarán todos sus registros de asistencia y justificaciones asociadas.';
        }
        if (entityType === 'teacher') {
            return 'Al eliminar este docente, se desasignarán las aulas que tiene a cargo.';
        }
        if (entityType === 'parent') {
            return 'Al eliminar este apoderado, se desvinculará de todos los estudiantes asociados.';
        }
        return 'Esta acción eliminará permanentemente todos los datos asociados.';
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Confirmar Eliminación" size="sm">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="shrink-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-danger) 15%, transparent)'
                        }}>
                            <AlertTriangle className="w-7 h-7" style={{ color: 'var(--color-danger)' }} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            ¿Estás seguro de eliminar a {entity.full_name}?
                        </h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                            Esta acción no se puede deshacer. Se eliminará permanentemente este {getEntityLabel()}.
                        </p>
                        <div className="p-3 rounded-lg border" style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--color-danger) 30%, transparent)'
                        }}>
                            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                                <strong>Advertencia:</strong> {getWarningMessage()}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg border" style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-danger) 30%, transparent)'
                    }}>
                        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{
                            backgroundColor: 'var(--color-danger)',
                            color: 'white'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
