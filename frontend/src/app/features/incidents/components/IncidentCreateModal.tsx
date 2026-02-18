'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  Gem,
  Paintbrush,
  Wind,
  ShowerHead,
  Shirt,
  BookX,
  ClipboardX,
  Users,
  MessageSquareWarning,
  Flag,
  UserX,
  MessageCircleX,
  Smartphone,
  Hammer,
  Megaphone,
  DoorOpen,
  Swords,
  ShieldAlert,
  Pill,
  Crosshair,
} from 'lucide-react';
import { Modal, Button, Select } from '@/app/components/ui/base';
import { useIncidentForm } from '../hooks';
import {
  IncidentType,
  INCIDENT_TYPE_LABELS,
} from '@/lib/api/incidents';

interface IncidentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_ICONS: Record<IncidentType, React.ComponentType<{ className?: string; size?: number }>> = {
  USO_JOYAS: Gem,
  UÑAS_PINTADAS: Paintbrush,
  CABELLO_SUELTO: Wind,
  FALTA_ASEO_PERSONAL: ShowerHead,
  UNIFORME_INCOMPLETO: Shirt,
  NO_TRAJO_UTILes: BookX,
  INCUMPLIMIENTO_TAREAS: ClipboardX,
  INDISCIPLINA_FORMACION: Users,
  INDISCIPLINA_AULA: MessageSquareWarning,
  FALTA_RESPETO_SIMBOLOS_PATRIOS: Flag,
  FALTA_RESPETO_DOCENTE: UserX,
  AGRESION_VERBAL: MessageCircleX,
  USO_CELULAR: Smartphone,
  DAÑO_INFRAESTRUCTURA: Hammer,
  ESCANDALO_AULA: Megaphone,
  SALIDA_NO_AUTORIZADA: DoorOpen,
  AGRESION_FISICA: Swords,
  ACOSO_ESCOLAR: ShieldAlert,
  CONSUMO_DROGAS: Pill,
  PORTE_ARMAS: Crosshair,
};

const ALL_TYPES: IncidentType[] = [
  'USO_JOYAS',
  'UÑAS_PINTADAS',
  'CABELLO_SUELTO',
  'FALTA_ASEO_PERSONAL',
  'UNIFORME_INCOMPLETO',
  'NO_TRAJO_UTILes',
  'INCUMPLIMIENTO_TAREAS',
  'INDISCIPLINA_FORMACION',
  'INDISCIPLINA_AULA',
  'FALTA_RESPETO_SIMBOLOS_PATRIOS',
  'FALTA_RESPETO_DOCENTE',
  'AGRESION_VERBAL',
  'USO_CELULAR',
  'DAÑO_INFRAESTRUCTURA',
  'ESCANDALO_AULA',
  'SALIDA_NO_AUTORIZADA',
  'AGRESION_FISICA',
  'ACOSO_ESCOLAR',
  'CONSUMO_DROGAS',
  'PORTE_ARMAS',
];

export function IncidentCreateModal({ isOpen, onClose, onSuccess }: IncidentCreateModalProps) {
  const {
    classrooms,
    students,
    selectedClassroom,
    isLoadingClassrooms,
    isLoadingStudents,
    isSubmitting,
    error,
    selectClassroom,
    createIncident,
    resetForm,
  } = useIncidentForm();

  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
      setSelectedStudentId('');
      setDescription('');
      resetForm();
    }
  }, [isOpen]);

  const classroomOptions = [
    { value: '', label: 'Seleccionar aula' },
    ...classrooms.map((c) => ({
      value: c.id,
      label: c.full_name,
    })),
  ];

  const studentOptions = [
    { value: '', label: isLoadingStudents ? 'Cargando...' : 'Seleccionar estudiante' },
    ...students.map((s) => ({
      value: s.id,
      label: s.full_name,
    })),
  ];

  const canSubmit = selectedClassroom && selectedStudentId && selectedType && !isSubmitting;

  const handleSubmit = async () => {
    if (!selectedClassroom || !selectedStudentId || !selectedType) return;

    const result = await createIncident({
      classroom_id: selectedClassroom,
      student_id: Number(selectedStudentId),
      type: selectedType,
      description: description || undefined,
    });

    if (result) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Incidencia"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xl">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
            icon={<Send size={22} />}
            className="text-xl"
          >
            Registrar
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Aula"
          value={selectedClassroom || ''}
          options={classroomOptions}
          onChange={(v) => {
            selectClassroom(v ? Number(v) : null);
            setSelectedStudentId('');
          }}
          disabled={isLoadingClassrooms}
        />
        <Select
          label="Estudiante"
          value={selectedStudentId}
          options={studentOptions}
          onChange={(v) => setSelectedStudentId(String(v))}
          disabled={!selectedClassroom || isLoadingStudents}
        />
      </div>

      <div className="mb-6">
        <label className="block text-xl font-medium text-text-primary mb-3">
          Tipo de incidencia
        </label>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-border p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              const isSelected = selectedType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <Icon
                    size={28}
                    className={isSelected ? 'text-primary' : 'text-text-secondary'}
                  />
                  <span className={`text-lg font-medium leading-tight ${
                    isSelected ? 'text-primary' : 'text-text-primary'
                  }`}>
                    {INCIDENT_TYPE_LABELS[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xl font-medium text-text-primary mb-1.5">
          Descripcion adicional{' '}
          <span className="text-text-secondary font-normal">
            (opcional)
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles adicionales sobre la incidencia..."
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
        <p className="text-sm text-text-secondary text-right mt-1">
          {description.length}/1000
        </p>
      </div>
    </Modal>
  );
}
