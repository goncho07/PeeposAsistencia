'use client';

import { useState } from 'react';
import { AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { Select, Button } from '@/app/components/ui/base';
import { useIncidentForm } from '../hooks';
import {
  IncidentType,
  IncidentSeverity,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from '@/lib/api/incidents';

interface IncidentFormProps {
  onSuccess?: () => void;
}

export function IncidentForm({ onSuccess }: IncidentFormProps) {
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
  } = useIncidentForm(onSuccess);

  const [formData, setFormData] = useState({
    student_id: '',
    type: '' as IncidentType | '',
    severity: 'LEVE' as IncidentSeverity,
    description: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

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

  const typeOptions = [
    { value: '', label: 'Seleccionar tipo' },
    ...Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const severityOptions = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassroom || !formData.student_id || !formData.type) {
      return;
    }

    const result = await createIncident({
      classroom_id: selectedClassroom,
      student_id: Number(formData.student_id),
      type: formData.type as IncidentType,
      description: formData.description || undefined,
    });

    if (result) {
      setShowSuccess(true);
      setFormData({
        student_id: '',
        type: '',
        severity: 'LEVE',
        description: '',
      });
      resetForm();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  const canSubmit = selectedClassroom && formData.student_id && formData.type;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border dark:border-border-dark">
          <div className="p-2.5 rounded-xl bg-warning/10">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
              Registrar Incidencia
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              La fecha y hora se registran automáticamente
            </p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-sm font-medium text-success">Incidencia registrada exitosamente</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Aula"
              value={selectedClassroom || ''}
              options={classroomOptions}
              onChange={(v) => {
                selectClassroom(v ? Number(v) : null);
                setFormData((prev) => ({ ...prev, student_id: '' }));
              }}
              disabled={isLoadingClassrooms}
            />

            <Select
              label="Estudiante"
              value={formData.student_id}
              options={studentOptions}
              onChange={(v) => setFormData((prev) => ({ ...prev, student_id: String(v) }))}
              disabled={!selectedClassroom || isLoadingStudents}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Incidencia"
              value={formData.type}
              options={typeOptions}
              onChange={(v) => setFormData((prev) => ({ ...prev, type: v as IncidentType }))}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Gravedad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {severityOptions.map((option) => {
                  const isActive = formData.severity === option.value;
                  const severityColors = {
                    LEVE: 'border-info text-info bg-info/10',
                    MODERADA: 'border-warning text-warning bg-warning/10',
                    GRAVE: 'border-danger text-danger bg-danger/10',
                  };
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          severity: option.value as IncidentSeverity,
                        }))
                      }
                      className={`p-2 rounded-xl border-2 transition-all text-sm font-medium ${
                        isActive
                          ? severityColors[option.value as IncidentSeverity]
                          : 'border-border dark:border-border-dark text-text-secondary bg-background'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Descripción adicional{' '}
              <span className="text-text-secondary dark:text-text-secondary-dark font-normal">
                (opcional)
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detalles adicionales sobre la incidencia..."
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 transition-all resize-none"
            />
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark text-right">
              {formData.description.length}/1000
            </p>
          </div>

          <div className="pt-4 border-t border-border dark:border-border-dark">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              icon={<Send size={18} />}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Incidencia'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
