'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/app/components/ui/base';
import { FilterPanel } from '@/app/components/ui/FilterPanel';
import { usersService } from '@/lib/api/users';
import {
  IncidentFilters as IIncidentFilters,
  IncidentType,
  INCIDENT_TYPE_LABELS,
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
  ].filter(Boolean).length;

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

  return (
    <FilterPanel
      activeCount={activeFiltersCount}
      onClear={() => onFiltersChange({})}
    >
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
    </FilterPanel>
  );
}
