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
  { id: 'total', label: 'Total', icon: <Users size={18} /> },
  { id: 'estudiante', label: 'Estudiantes', icon: <GraduationCap size={18} /> },
  { id: 'docente', label: 'Docentes', icon: <Briefcase size={18} /> },
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
        <div className="h-full w-full bg-card animate-pulse rounded-2xl" />
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card padding="lg" className="flex items-center justify-center min-h-[500px]">
        <p className="text-text-secondary opacity-60">No hay datos disponibles</p>
      </Card>
    );
  }

  const chartData = getChartData(stats, filter);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card padding="lg" className="h-full flex flex-col">
      <div className="flex flex-col mb-12 gap-8">
        <div>
          <h3 className="text-2xl font-black text-text-primary tracking-tight">
            Asistencia del Día
          </h3>
          <p className="text-sm text-text-secondary opacity-60 font-bold mt-1">
            Distribución en tiempo real por categoría
          </p>
        </div>

        <div className="w-full">
          <Tabs
            tabs={FILTER_TABS}
            activeTab={filter}
            onChange={(id) => setFilter(id as FilterType)}
            size="lg"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
        <div className="relative w-72 h-72 lg:w-80 lg:h-80 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={115}
                paddingAngle={8}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                stroke="none"
                cornerRadius={12}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="outline-none transition-all duration-300"
                    style={{ 
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-5xl font-black text-text-primary tracking-tight">
                {activeIndex !== null ? chartData[activeIndex].value : total}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-text-secondary opacity-70">
                {activeIndex !== null ? chartData[activeIndex].name : 'Total'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 w-full max-w-md">
          {chartData.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={index}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`
                  flex items-center justify-between p-5 rounded-2xl bg-background transition-all duration-200 
                  ${isActive ? 'bg-primary/5 ring-2 ring-primary/20 scale-105' : 'hover:bg-primary/5'}
                  cursor-pointer
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-lg font-bold text-text-primary">
                    {item.name}
                  </span>
                </div>

                <span className="text-2xl font-black text-text-primary">
                  {item.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}