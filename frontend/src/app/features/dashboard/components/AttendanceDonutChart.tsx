'use client';
import { useState } from 'react';
import { Card, Tabs, Tab } from '@/app/components/ui/base';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, Briefcase } from 'lucide-react';
import { DailyStats } from '../hooks/useDailyStats';

interface AttendanceDonutChartProps {
  stats: DailyStats | null;
  loading: boolean;
}

type FilterType = 'total' | 'estudiante' | 'docente';

const COLORS = {
  presente: 'var(--color-success)',
  tardanza: 'var(--color-warning)',
  ausente: 'var(--color-danger)',
  justificada: 'var(--color-secondary)',
};

const FILTER_TABS: Tab[] = [
  { id: 'total', label: 'Total', icon: <Users size={16} /> },
  { id: 'estudiante', label: 'Estudiantes', icon: <GraduationCap size={16} /> },
  { id: 'docente', label: 'Docentes', icon: <Briefcase size={16} /> },
];

function getChartData(stats: DailyStats, filter: FilterType) {
  switch (filter) {
    case 'estudiante':
      return [
        { name: 'Presente', value: stats.students.present, color: COLORS.presente },
        { name: 'Tardanza', value: stats.students.late, color: COLORS.tardanza },
        { name: 'Ausente', value: stats.students.absent, color: COLORS.ausente },
        { name: 'Justificada', value: stats.students.justified, color: COLORS.justificada },
      ];
    case 'docente':
      return [
        { name: 'Presente', value: stats.teachers.present, color: COLORS.presente },
        { name: 'Tardanza', value: stats.teachers.late, color: COLORS.tardanza },
        { name: 'Ausente', value: stats.teachers.absent, color: COLORS.ausente },
      ];
    default:
      return [
        { name: 'Presente', value: stats.students.present + stats.teachers.present, color: COLORS.presente },
        { name: 'Tardanza', value: stats.students.late + stats.teachers.late, color: COLORS.tardanza },
        { name: 'Ausente', value: stats.students.absent + stats.teachers.absent + stats.students.justified, color: COLORS.ausente },
      ];
  }
}

export function AttendanceDonutChart({ stats, loading }: AttendanceDonutChartProps) {
  const [filter, setFilter] = useState<FilterType>('total');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <Card padding="lg" className="h-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <div className="h-6 w-40 bg-card animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-card animate-pulse rounded-lg mt-2" />
          </div>
          <div className="h-10 w-64 bg-card animate-pulse rounded-xl" />
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-around gap-10">
          <div className="w-56 h-56 rounded-full bg-card animate-pulse" />
          <div className="flex flex-col gap-3 w-full xl:max-w-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card padding="lg" className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-secondary opacity-60">No hay datos disponibles</p>
      </Card>
    );
  }

  const chartData = getChartData(stats, filter);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card padding="lg" className="h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Asistencia del Día</h3>
          <p className="text-xs text-text-secondary opacity-60 font-medium">
            Distribución en tiempo real
          </p>
        </div>

        <Tabs
          tabs={FILTER_TABS}
          activeTab={filter}
          onChange={(id) => setFilter(id as FilterType)}
          size="sm"
        />
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-around gap-10">
        <div className="relative w-56 h-56 shrink-0 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                stroke="none"
                cornerRadius={10}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="outline-none transition-opacity duration-300"
                    style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-3xl font-bold text-text-primary">
                {activeIndex !== null ? chartData[activeIndex].value : total}
              </span>
              <span className="text-xs font-medium text-text-secondary opacity-60">
                {activeIndex !== null ? chartData[activeIndex].name : 'Total'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full xl:max-w-sm">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const isActive = activeIndex === index;

            return (
              <button
                key={index}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl bg-card
                  transition-all duration-200 text-left w-full
                  ${isActive ? 'scale-[1.01] ring-2 ring-primary/20' : 'hover:scale-[1.01]'}
                `}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-sm font-medium text-text-primary flex-1">
                  {item.name}
                </span>

                <div className="flex-1 max-w-24">
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 min-w-16">
                  <span className="text-lg font-bold text-text-primary">{item.value}</span>
                  <span className="text-xs text-text-secondary ml-1">({percentage.toFixed(0)}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
