'use client';
import { CarnetFilters as Filters } from '@/lib/api/carnets';
import { Select } from '@/app/components/ui/base';
import { Users, GraduationCap, Briefcase, UserCog, LucideIcon } from 'lucide-react';
import type { AttendableType } from '@/lib/api/attendance';

const TYPE_CONFIG: Record<AttendableType, { label: string; icon: LucideIcon }> = {
    student: { label: 'Estudiantes', icon: GraduationCap },
    teacher: { label: 'Docentes', icon: Briefcase },
    user: { label: 'Personal', icon: UserCog },
};

interface CarnetFiltersProps {
    filters: Filters;
    onChange: (filters: Filters) => void;
    allowedTypes: AttendableType[];
    availableLevels: string[];
    availableGrades: number[];
    availableSections: string[];
}

export function CarnetFiltersForm({
    filters,
    onChange,
    allowedTypes,
    availableLevels,
    availableGrades,
    availableSections,
}: CarnetFiltersProps) {
    const userTypeOptions: { value: string; label: string; icon: LucideIcon }[] = [
        ...(allowedTypes.length > 1 ? [{ value: 'all', label: 'Todos', icon: Users }] : []),
        ...allowedTypes.map((type) => ({
            value: type,
            label: TYPE_CONFIG[type].label,
            icon: TYPE_CONFIG[type].icon,
        })),
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
                <label className="block text-xl font-medium mb-3 text-text-primary dark:text-text-primary-dark">
                    Tipo de Usuario
                </label>
                <div className={`grid gap-2 ${
                    userTypeOptions.length === 1 ? 'grid-cols-1' :
                    userTypeOptions.length === 2 ? 'grid-cols-2' :
                    userTypeOptions.length === 3 ? 'grid-cols-3' :
                    'grid-cols-2 sm:grid-cols-4'
                }`}>
                    {userTypeOptions.map((option) => {
                        const isActive = filters.type === option.value;
                        const Icon = option.icon;
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
                                    p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer
                                    ${isActive
                                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                        : 'border-border dark:border-border-dark hover:border-primary/50'
                                    }
                                `}
                            >
                                <Icon
                                    className={`w-6 h-6 ${
                                        isActive
                                            ? 'text-primary dark:text-primary-light'
                                            : 'text-text-secondary dark:text-text-secondary-dark'
                                    }`}
                                />
                                <span
                                    className={`text-xl font-medium ${
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

            {filters.type !== 'all' && filters.type !== 'user' && (
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
