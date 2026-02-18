'use client';
import { useMemo } from 'react';
import { Select } from '@/app/components/ui/base';
import { FilterPanel } from '@/app/components/ui/FilterPanel';
import { EntityType, Teacher, Student, Entity } from '@/lib/api/users';

export interface FilterValues {
    level?: string;
    grade?: string;
    section?: string;
    enrollmentStatus?: string;
    area?: string;
    status?: string;
    role?: string;
    documentType?: string;
}

interface UserFiltersProps {
    entityType: EntityType;
    entities: Entity[];
    filters: FilterValues;
    onFiltersChange: (filters: FilterValues) => void;
}

const ENROLLMENT_STATUSES = ['MATRICULADO', 'RETIRADO', 'TRASLADADO'];
const ENTITY_STATUSES = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
const USER_ROLES = ['SUPERADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'SECRETARIO', 'COORDINADOR', 'AUXILIAR', 'DOCENTE', 'ESCANER'];
const DOCUMENT_TYPES = ['DNI', 'CE', 'PAS', 'CI', 'PTP'];

function toSelectOptions(values: string[], placeholder: string = 'Todos') {
    return [
        { value: '', label: placeholder },
        ...values.map((v) => ({ value: v, label: v })),
    ];
}

export function UserFilters({ entityType, entities, filters, onFiltersChange }: UserFiltersProps) {
    const availableLevels = useMemo(() => {
        if (entityType === 'student') {
            const levels = new Set<string>();
            entities.forEach((entity) => {
                const classroom = (entity as Student).classroom;
                if (classroom?.level) levels.add(classroom.level);
            });
            return Array.from(levels).sort();
        }
        if (entityType === 'teacher') {
            const levels = new Set<string>();
            entities.forEach((entity) => {
                const teacher = entity as Teacher;
                if (teacher.level) levels.add(teacher.level);
            });
            return Array.from(levels).sort();
        }
        return [];
    }, [entities, entityType]);

    const availableGrades = useMemo(() => {
        if (entityType !== 'student' || !filters.level) return [];
        const grades = new Set<string>();
        entities.forEach((entity) => {
            const classroom = (entity as Student).classroom;
            if (classroom && classroom.level === filters.level) {
                grades.add(classroom.grade.toString());
            }
        });
        return Array.from(grades).sort((a, b) => Number(a) - Number(b));
    }, [entities, entityType, filters.level]);

    const availableSections = useMemo(() => {
        if (entityType !== 'student' || !filters.level || !filters.grade) return [];
        const sections = new Set<string>();
        entities.forEach((entity) => {
            const classroom = (entity as Student).classroom;
            if (classroom && classroom.level === filters.level && classroom.grade.toString() === filters.grade) {
                sections.add(classroom.section);
            }
        });
        return Array.from(sections).sort();
    }, [entities, entityType, filters.level, filters.grade]);

    const availableAreas = useMemo(() => {
        const areas = new Set<string>();
        entities.forEach((entity) => {
            if (entityType === 'teacher') {
                const teacher = entity as Teacher;
                if ((teacher as any).area) areas.add((teacher as any).area);
            }
        });
        return Array.from(areas).sort();
    }, [entities, entityType]);

    const updateFilter = (key: keyof FilterValues, value: string | number) => {
        const stringValue = value ? value.toString() : undefined;
        const newFilters = { ...filters, [key]: stringValue };

        if (entityType === 'student') {
            if (key === 'level') {
                newFilters.grade = undefined;
                newFilters.section = undefined;
            } else if (key === 'grade') {
                newFilters.section = undefined;
            }
        }

        onFiltersChange(newFilters);
    };

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    const renderFilters = () => {
        switch (entityType) {
            case 'student':
                return (
                    <>
                        <Select
                            label="Nivel"
                            value={filters.level || ''}
                            options={toSelectOptions(availableLevels)}
                            onChange={(v) => updateFilter('level', v)}
                        />
                        <Select
                            label="Grado"
                            value={filters.grade || ''}
                            options={toSelectOptions(availableGrades)}
                            onChange={(v) => updateFilter('grade', v)}
                            disabled={!filters.level}
                        />
                        <Select
                            label="Sección"
                            value={filters.section || ''}
                            options={toSelectOptions(availableSections)}
                            onChange={(v) => updateFilter('section', v)}
                            disabled={!filters.grade}
                        />
                        <Select
                            label="Estado"
                            value={filters.enrollmentStatus || ''}
                            options={toSelectOptions(ENROLLMENT_STATUSES)}
                            onChange={(v) => updateFilter('enrollmentStatus', v)}
                        />
                    </>
                );

            case 'teacher':
                return (
                    <>
                        <Select
                            label="Nivel"
                            value={filters.level || ''}
                            options={toSelectOptions(availableLevels)}
                            onChange={(v) => updateFilter('level', v)}
                        />
                        <Select
                            label="Área"
                            value={filters.area || ''}
                            options={toSelectOptions(availableAreas)}
                            onChange={(v) => updateFilter('area', v)}
                        />
                        <Select
                            label="Estado"
                            value={filters.status || ''}
                            options={toSelectOptions(ENTITY_STATUSES)}
                            onChange={(v) => updateFilter('status', v)}
                        />
                    </>
                );

            case 'parent':
                return (
                    <Select
                        label="Tipo de Documento"
                        value={filters.documentType || ''}
                        options={toSelectOptions(DOCUMENT_TYPES)}
                        onChange={(v) => updateFilter('documentType', v)}
                    />
                );

            case 'user':
                return (
                    <>
                        <Select
                            label="Rol"
                            value={filters.role || ''}
                            options={toSelectOptions(USER_ROLES)}
                            onChange={(v) => updateFilter('role', v)}
                        />
                        <Select
                            label="Estado"
                            value={filters.status || ''}
                            options={toSelectOptions(ENTITY_STATUSES)}
                            onChange={(v) => updateFilter('status', v)}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <FilterPanel
            activeCount={activeFiltersCount}
            onClear={() => onFiltersChange({})}
        >
            {renderFilters()}
        </FilterPanel>
    );
}
