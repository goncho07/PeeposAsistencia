'use client';
import { useState, useMemo } from 'react';
import { Card, Tabs } from '@/app/components/ui/base';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, Briefcase, UserCog } from 'lucide-react';
import { DailyStats, AttendableType } from '../hooks/useDailyStats';

interface AttendanceDonutChartProps {
  stats: DailyStats | null;
  loading: boolean;
}

type FilterType = 'total' | 'student' | 'teacher' | 'user';

const COLORS = {
  presente: 'var(--color-success)',
  tardanza: 'var(--color-warning)',
  ausente: 'var(--color-danger)',
  justificada: 'var(--color-secondary)',
};

const TYPE_LABELS: Record<string, string> = {
  student: 'Estudiantes',
  teacher: 'Docentes',
  user: 'Personal',
};

function getPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getStatsForType(stats: DailyStats, type: AttendableType) {
  return stats[type === 'student' ? 'students' : type === 'teacher' ? 'teachers' : 'users'];
}

function getChartData(stats: DailyStats, filter: FilterType) {
  if (filter !== 'total') {
    const s = getStatsForType(stats, filter as AttendableType);
    if (!s) return [];
    const data = [
      { name: 'Presente', value: s.present, color: COLORS.presente },
      { name: 'Tardanza', value: s.late, color: COLORS.tardanza },
      { name: 'Ausente', value: s.absent, color: COLORS.ausente },
    ];
    if (s.justified) {
      data.push({ name: 'Justificada', value: s.justified, color: COLORS.justificada });
    }
    return data;
  }

  let present = 0, late = 0, absent = 0;
  for (const type of stats.allowed_types) {
    const s = getStatsForType(stats, type);
    if (!s) continue;
    present += s.present;
    late += s.late;
    absent += s.absent + (s.justified ?? 0);
  }
  return [
    { name: 'Presente', value: present, color: COLORS.presente },
    { name: 'Tardanza', value: late, color: COLORS.tardanza },
    { name: 'Ausente', value: absent, color: COLORS.ausente },
  ];
}

export function AttendanceDonutChart({ stats, loading }: AttendanceDonutChartProps) {
  const [filter, setFilter] = useState<FilterType>('total');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filterTabs = useMemo(() => {
    const types = stats?.allowed_types ?? [];
    const tabs = [{ id: 'total', label: 'Total', icon: <Users size={18} /> }];
    if (types.includes('student')) tabs.push({ id: 'student', label: 'Estudiantes', icon: <GraduationCap size={18} /> });
    if (types.includes('teacher')) tabs.push({ id: 'teacher', label: 'Docentes', icon: <Briefcase size={18} /> });
    if (types.includes('user')) tabs.push({ id: 'user', label: 'Personal', icon: <UserCog size={18} /> });
    return tabs;
  }, [stats?.allowed_types]);

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
      <Card padding="lg" className="flex items-center justify-center min-h-[500px]">
        <p className="text-text-secondary opacity-60">No hay datos disponibles</p>
      </Card>
    );
  }

  const chartData = getChartData(stats, filter);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card padding="lg" className="h-full">
      <div className={`flex flex-col ${filterTabs.length > 2 ? 'mb-10' : 'mb-6'} gap-4`}>
        <div>
          <h3 className="text-2xl font-bold text-text-primary">Asistencia del Día</h3>
          {filterTabs.length <= 2 && stats.allowed_types.length === 1 && (
            <p className="text-lg text-text-secondary mt-1">
              {TYPE_LABELS[stats.allowed_types[0]] ?? stats.allowed_types[0]}
            </p>
          )}
        </div>

        {filterTabs.length > 2 && (
          <div className="w-full">
            <Tabs
              tabs={filterTabs}
              activeTab={filter}
              onChange={(id) => setFilter(id as FilterType)}
              size="lg"
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-around gap-10">
        <div className="relative w-60 h-60 shrink-0 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={95}
                outerRadius={115}
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
              <span className="block text-5xl font-bold text-text-primary">
                {activeIndex !== null ? getPercent(chartData[activeIndex].value, total) : '100%'}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-text-secondary opacity-70">
                {activeIndex !== null ? chartData[activeIndex].name : 'Total'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full xl:max-w-sm">
          {chartData.map((item, index) => {
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
                  cursor-pointer
                `}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-lg font-bold text-text-primary flex-1">
                  {item.name}
                </span>

                <span className="text-2xl font-black text-text-primary">
                  {getPercent(item.value, total)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
