'use client';
import { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Select } from '@/app/components/ui/base';
import { EntityType, Student, Teacher, Entity } from '@/lib/api/users';

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
const ENTITY_STATUSES = ['ACTIVO', 'INACTIVO'];
const USER_ROLES = ['ADMIN', 'ASISTENTE', 'VIEWER'];
const DOCUMENT_TYPES = ['DNI', 'CE', 'PAS', 'CI', 'PTP'];

function toSelectOptions(values: string[], placeholder: string = 'Todos') {
    return [
        { value: '', label: placeholder },
        ...values.map((v) => ({ value: v, label: v })),
    ];
}

export function UserFilters({ entityType, entities, filters, onFiltersChange }: UserFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const availableLevels = useMemo(() => {
        const levels = new Set<string>();
        entities.forEach((entity) => {
            if (entityType === 'student') {
                const student = entity as Student;
                if (student.classroom?.level) levels.add(student.classroom.level);
            } else if (entityType === 'teacher') {
                const teacher = entity as Teacher;
                if (teacher.level) levels.add(teacher.level);
            }
        });
        return Array.from(levels).sort();
    }, [entities, entityType]);

    const availableGrades = useMemo(() => {
        if (!filters.level) return [];
        const grades = new Set<string>();
        entities.forEach((entity) => {
            if (entityType === 'student') {
                const student = entity as Student;
                if (student.classroom && student.classroom.level === filters.level) {
                    grades.add(student.classroom.grade.toString());
                }
            }
        });
        return Array.from(grades).sort((a, b) => Number(a) - Number(b));
    }, [entities, entityType, filters.level]);

    const availableSections = useMemo(() => {
        if (!filters.level || !filters.grade) return [];
        const sections = new Set<string>();
        entities.forEach((entity) => {
            if (entityType === 'student') {
                const student = entity as Student;
                if (
                    student.classroom &&
                    student.classroom.level === filters.level &&
                    student.classroom.grade.toString() === filters.grade
                ) {
                    sections.add(student.classroom.section);
                }
            }
        });
        return Array.from(sections).sort();
    }, [entities, entityType, filters.level, filters.grade]);

    const availableAreas = useMemo(() => {
        const areas = new Set<string>();
        entities.forEach((entity) => {
            if (entityType === 'teacher') {
                const teacher = entity as Teacher;
                if (teacher.area) areas.add(teacher.area);
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

    const clearFilters = () => {
        onFiltersChange({});
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
        <>
            <div className="lg:hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-text-secondary dark:text-text-secondary-dark" />
                        <span className="font-medium text-text-primary dark:text-text-primary-dark">Filtros</span>
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
                            <Filter size={18} className="text-text-secondary dark:text-text-secondary-dark" />
                            <span className="font-semibold text-text-primary dark:text-text-primary-dark">Filtros</span>
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

                    <div className="space-y-4">
                        {renderFilters()}
                    </div>

                    {activeFiltersCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
