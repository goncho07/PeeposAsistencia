'use client';
import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search, Download, Users, GraduationCap } from 'lucide-react';
import { Select, Button } from '@/app/components/ui/base';
import { ReportFilters } from '../hooks';

interface ReportFiltersPanelProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const renderUserTypeSelector = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark">
        Tipo de Usuario
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'student', label: 'Estudiantes', icon: Users },
          { value: 'teacher', label: 'Docentes', icon: GraduationCap },
        ].map((option) => {
          const Icon = option.icon;
          const isActive = filters.type === option.value;
          return (
            <button
              key={option.value}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  type: option.value as 'student' | 'teacher',
                  level: '',
                  grade: undefined,
                  section: '',
                  shift: '',
                })
              }
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                isActive
                  ? 'border-primary dark:border-primary-light bg-primary/10 dark:bg-primary-light/10'
                  : 'border-border dark:border-border-dark hover:border-primary/50'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? 'text-primary dark:text-primary-light'
                    : 'text-text-secondary dark:text-text-secondary-dark'
                }`}
              />
              <span
                className={`text-xs font-medium ${
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
  );

  const renderFilters = () => (
    <>
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
    </>
  );

  const renderActions = () => (
    <div className="pt-4 space-y-3 border-t border-border dark:border-border-dark">
      <Button
        variant="primary"
        fullWidth
        onClick={onGenerate}
        disabled={isLoading || !canGenerate}
        loading={isLoading}
        icon={<Search size={18} />}
      >
        {isLoading ? 'Generando...' : 'Generar Reporte'}
      </Button>

      {hasSearched && onDownloadPDF && (
        <Button
          variant="outline"
          fullWidth
          onClick={onDownloadPDF}
          icon={<Download size={18} />}
        >
          Descargar PDF
        </Button>
      )}
    </div>
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
              Filtros de Reporte
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
            {renderActions()}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24 p-5 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border dark:border-border-dark">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary dark:text-primary-light" />
              <span className="font-bold text-text-primary dark:text-text-primary-dark">
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

          <div className="space-y-4">
            {renderFilters()}
          </div>

          {renderActions()}

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
