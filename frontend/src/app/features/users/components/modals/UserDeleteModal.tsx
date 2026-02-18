'use client';
import { useState } from 'react';
import { Modal, Button } from '@/app/components/ui/base';
import { Entity, EntityType } from '@/lib/api/users';
import { AlertTriangle } from 'lucide-react';

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  entity: Entity | null;
  entityType: EntityType;
}

export function UserDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entity,
  entityType,
}: UserDeleteModalProps) {
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
      setError(
        err.response?.data?.message ||
          'Error al eliminar. Inténtalo nuevamente.'
      );
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} className='text-xl'>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading} className='text-xl'>
            Eliminar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {/* <div className="shrink-0">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-danger/15">
              <AlertTriangle className="w-7 h-7 text-danger" />
            </div>
          </div> */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-text-primary dark:text-text-primary-dark">
              ¿Estás seguro de eliminar a {entity.full_name}?
            </h3>
            <p className="text-base mb-3 text-text-secondary dark:text-text-secondary-dark">
              Esta acción no se puede deshacer. Se eliminará permanentemente
              este {getEntityLabel()}.
            </p>
            <div className="p-3 rounded-lg border bg-danger/8 border-danger/30">
              <p className="text-base text-danger">
                <strong>Advertencia:</strong> {getWarningMessage()}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger text-danger">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
