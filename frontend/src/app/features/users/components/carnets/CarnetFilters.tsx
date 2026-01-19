'use client';
import { CarnetFilters as Filters } from '@/lib/api/carnets';
import { Select } from '@/app/components/ui/base';
import { Users, GraduationCap } from 'lucide-react';

interface CarnetFiltersProps {
    filters: Filters;
    onChange: (filters: Filters) => void;
    availableLevels: string[];
    availableGrades: number[];
    availableSections: string[];
}

export function CarnetFiltersForm({
    filters,
    onChange,
    availableLevels,
    availableGrades,
    availableSections,
}: CarnetFiltersProps) {
    const userTypeOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'student', label: 'Estudiantes' },
        { value: 'teacher', label: 'Docentes' },
    ];

    const levelOptions = [
        { value: 'all', label: 'Todos los niveles' },
        ...availableLevels.map((level) => ({
            value: level,
            label: level.charAt(0) + level.slice(1).toLowerCase(),
        })),
    ];

    const gradeOptions = [
        { value: 'all', label: 'Todos los grados' },
        ...availableGrades.map((grade) => ({
            value: grade.toString(),
            label: filters.level === 'INICIAL' ? `${grade} años` : `${grade}°`,
        })),
    ];

    const sectionOptions = [
        { value: 'all', label: 'Todas las secciones' },
        ...availableSections.map((section) => ({
            value: section,
            label: section,
        })),
    ];

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium mb-3 text-text-primary dark:text-text-primary-dark">
                    Tipo de Usuario
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {userTypeOptions.map((option) => {
                        const isActive = filters.type === option.value;
                        const Icon = option.value === 'teacher' ? GraduationCap : Users;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        type: option.value as Filters['type'],
                                        level: 'all',
                                        grade: 'all',
                                        section: 'all',
                                    })
                                }
                                className={`
                                    p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                    ${isActive
                                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                        : 'border-border dark:border-border-dark hover:border-primary/50'
                                    }
                                `}
                            >
                                <Icon
                                    className={`w-5 h-5 ${
                                        isActive
                                            ? 'text-primary dark:text-primary-light'
                                            : 'text-text-secondary dark:text-text-secondary-dark'
                                    }`}
                                />
                                <span
                                    className={`text-sm font-medium ${
                                        isActive
                                            ? 'text-primary dark:text-primary-light'
                                            : 'text-text-secondary dark:text-text-secondary-dark'
                                    }`}
                                >
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {filters.type !== 'all' && (
                <div className="space-y-4 pt-4 border-t border-border dark:border-border-dark">
                    <Select
                        label="Nivel"
                        value={filters.level || 'all'}
                        options={levelOptions}
                        onChange={(value) =>
                            onChange({
                                ...filters,
                                level: value as string,
                                grade: 'all',
                                section: 'all',
                            })
                        }
                    />

                    {filters.type === 'student' && filters.level !== 'all' && (
                        <>
                            <Select
                                label="Grado"
                                value={filters.grade || 'all'}
                                options={gradeOptions}
                                onChange={(value) =>
                                    onChange({
                                        ...filters,
                                        grade: value as string,
                                        section: 'all',
                                    })
                                }
                            />

                            {filters.grade !== 'all' && (
                                <Select
                                    label="Sección"
                                    value={filters.section || 'all'}
                                    options={sectionOptions}
                                    onChange={(value) =>
                                        onChange({ ...filters, section: value as string })
                                    }
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
