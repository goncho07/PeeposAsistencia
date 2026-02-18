'use client';
import { Search, Download, Users, GraduationCap, UserCog } from 'lucide-react';
import { Select, Button } from '@/app/components/ui/base';
import { FilterPanel } from '@/app/components/ui/FilterPanel';
import { ReportFilters } from '../hooks';
import { AttendableType } from '@/lib/api/attendance';

interface ReportFiltersPanelProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  allowedTypes: AttendableType[];
  availableLevels: string[];
  availableGrades: number[];
  availableSections: string[];
  availableShifts: string[];
  isLoading: boolean;
  hasSearched: boolean;
  onGenerate: () => void;
  onDownloadPDF?: () => void;
  canGenerate?: boolean;
}

const MONTH_OPTIONS = [
  { value: 0, label: 'Enero' },
  { value: 1, label: 'Febrero' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' },
];

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'bimester', label: 'Bimestral' },
];

const BIMESTER_OPTIONS = [
  { value: '', label: 'Seleccionar bimestre' },
  { value: 1, label: 'Bimestre 1' },
  { value: 2, label: 'Bimestre 2' },
  { value: 3, label: 'Bimestre 3' },
  { value: 4, label: 'Bimestre 4' },
];

function toSelectOptions(values: (string | number)[], allLabel: string = 'Todos') {
  return [
    { value: '', label: allLabel },
    ...values.map((v) => ({
      value: v,
      label: typeof v === 'string' ? v.charAt(0) + v.slice(1).toLowerCase() : `${v}`,
    })),
  ];
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return [
    { value: currentYear - 1, label: `${currentYear - 1}` },
    { value: currentYear, label: `${currentYear}` },
    { value: currentYear + 1, label: `${currentYear + 1}` },
  ];
}

export function ReportFiltersPanel({
  filters,
  onFiltersChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  allowedTypes,
  availableLevels,
  availableGrades,
  availableSections,
  availableShifts,
  isLoading,
  hasSearched,
  onGenerate,
  onDownloadPDF,
  canGenerate: canGenerateProp,
}: ReportFiltersPanelProps) {
  const activeFiltersCount = [
    filters.level,
    filters.grade,
    filters.section,
    filters.shift,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      level: '',
      grade: undefined,
      section: '',
      shift: '',
    });
  };

  const bimesterValid = filters.period !== 'bimester' || !!filters.bimester;
  const canGenerate = canGenerateProp !== undefined ? canGenerateProp : bimesterValid;

  const allTypeOptions = [
    { value: 'student', label: 'Estudiantes', icon: Users },
    { value: 'teacher', label: 'Docentes', icon: GraduationCap },
    { value: 'user', label: 'Usuarios', icon: UserCog },
  ];

  const visibleTypeOptions = allTypeOptions.filter((opt) =>
    allowedTypes.includes(opt.value as AttendableType)
  );

  const renderUserTypeSelector = () => {
    if (visibleTypeOptions.length <= 1) return null;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          Tipo de Usuario
        </label>
        <div className={`grid gap-2 ${visibleTypeOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {visibleTypeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filters.type === option.value;
            return (
              <button
                key={option.value}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    type: option.value as AttendableType,
                    level: '',
                    grade: undefined,
                    section: '',
                    shift: '',
                  })
                }
                className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const actions = (
    <div className="pt-4 space-y-3 mt-4 border-t border-border">
      <Button
        variant="primary"
        fullWidth
        onClick={onGenerate}
        disabled={isLoading || !canGenerate}
        loading={isLoading}
        icon={<Search size={24} />}
        className="text-xl"
      >
        {isLoading ? 'Generando...' : 'Generar Reporte'}
      </Button>

      {hasSearched && onDownloadPDF && (
        <Button
          variant="outline"
          fullWidth
          onClick={onDownloadPDF}
          icon={<Download size={24} />}
          className="text-xl"
        >
          Descargar PDF
        </Button>
      )}
    </div>
  );

  return (
    <FilterPanel
      activeCount={activeFiltersCount}
      onClear={clearFilters}
      actions={actions}
    >
      <Select
        label="Periodo"
        value={filters.period}
        options={PERIOD_OPTIONS}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            period: v as 'daily' | 'monthly' | 'bimester',
            bimester: undefined,
          })
        }
      />

      {filters.period === 'bimester' && (
        <Select
          label="Bimestre"
          value={filters.bimester || ''}
          options={BIMESTER_OPTIONS}
          onChange={(v) =>
            onFiltersChange({
              ...filters,
              bimester: v ? Number(v) : undefined,
            })
          }
        />
      )}

      {filters.period === 'monthly' && (
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Mes"
            value={selectedMonth}
            options={MONTH_OPTIONS}
            onChange={(v) => onMonthChange(Number(v))}
          />
          <Select
            label="Año"
            value={selectedYear}
            options={getYearOptions()}
            onChange={(v) => onYearChange(Number(v))}
          />
        </div>
      )}

      {renderUserTypeSelector()}

      <Select
        label="Nivel"
        value={filters.level}
        options={toSelectOptions(availableLevels, 'Todos los niveles')}
        onChange={(v) =>
          onFiltersChange({
            ...filters,
            level: String(v),
            grade: undefined,
            section: '',
            shift: '',
          })
        }
      />

      {filters.type === 'student' && filters.level && (
        <Select
          label="Grado"
          value={filters.grade || ''}
          options={toSelectOptions(
            availableGrades.map((g) =>
              filters.level === 'INICIAL' ? `${g} años` : `${g}°`
            ),
            'Todos los grados'
          ).map((opt, idx) =>
            idx === 0 ? opt : { value: availableGrades[idx - 1], label: opt.label }
          )}
          onChange={(v) =>
            onFiltersChange({
              ...filters,
              grade: v ? Number(v) : undefined,
              section: '',
            })
          }
        />
      )}

      {filters.type === 'student' && filters.grade && (
        <Select
          label="Sección"
          value={filters.section}
          options={toSelectOptions(availableSections, 'Todas las secciones')}
          onChange={(v) => onFiltersChange({ ...filters, section: String(v) })}
        />
      )}

      {filters.level && (
        <Select
          label="Turno"
          value={filters.shift}
          options={toSelectOptions(availableShifts, 'Todos los turnos')}
          onChange={(v) => onFiltersChange({ ...filters, shift: String(v) })}
        />
      )}
    </FilterPanel>
  );
}
