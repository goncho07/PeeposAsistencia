'use client';

import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Select } from '@/app/components/ui/base';
import { usersService } from '@/lib/api/users';
import {
  IncidentFilters as IIncidentFilters,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from '@/lib/api/incidents';

interface Classroom {
  id: number;
  full_name: string;
  level: string;
  grade: number;
  section: string;
  shift: string;
}

interface IncidentFiltersProps {
  filters: IIncidentFilters;
  onFiltersChange: (filters: IIncidentFilters) => void;
}

export function IncidentFilters({ filters, onFiltersChange }: IncidentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true);
        const data = await usersService.getClassrooms();
        setClassrooms(data || []);
      } catch (err) {
        console.error('Error loading classrooms:', err);
      } finally {
        setIsLoadingClassrooms(false);
      }
    };
    loadClassrooms();
  }, []);

  const activeFiltersCount = [
    filters.classroom_id,
    filters.type,
    filters.severity,
    filters.status,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const classroomOptions = [
    { value: '', label: 'Todas las aulas' },
    ...classrooms.map((c) => ({
      value: c.id,
      label: c.full_name,
    })),
  ];

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const severityOptions = [
    { value: '', label: 'Todas las gravedades' },
    ...Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    ...Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const renderFilters = () => (
    <>
      <Select
        label="Aula"
        value={filters.classroom_id || ''}
        options={classroomOptions}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            classroom_id: v ? Number(v) : undefined,
          })
        }
        disabled={isLoadingClassrooms}
      />

      <Select
        label="Tipo"
        value={filters.type || ''}
        options={typeOptions}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            type: v ? (v as IncidentType) : undefined,
          })
        }
      />

      <Select
        label="Gravedad"
        value={filters.severity || ''}
        options={severityOptions}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            severity: v ? (v as IncidentSeverity) : undefined,
          })
        }
      />

      <Select
        label="Estado"
        value={filters.status || ''}
        options={statusOptions}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            status: v ? (v as IncidentStatus) : undefined,
          })
        }
      />
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-text-secondary dark:text-text-secondary-dark" />
            <span className="font-medium text-text-primary dark:text-text-primary-dark">
              Filtros
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-white">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={18} className="text-text-secondary dark:text-text-secondary-dark" />
          ) : (
            <ChevronDown size={18} className="text-text-secondary dark:text-text-secondary-dark" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm space-y-4">
            {renderFilters()}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <X size={16} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 p-4 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary dark:text-primary-light" />
              <span className="font-semibold text-text-primary dark:text-text-primary-dark">
                Filtros
              </span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <X size={14} />
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-4">{renderFilters()}</div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo
                {activeFiltersCount > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
