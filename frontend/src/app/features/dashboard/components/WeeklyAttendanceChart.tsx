'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/base';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { WeeklyStats } from '../hooks/useWeeklyStats';

interface WeeklyAttendanceChartProps {
  weeklyStats: WeeklyStats | null;
  loading: boolean;
}

const COLOR_VARS = {
  present: '--color-success',
  late: '--color-warning',
  absent: '--color-danger',
};

function useResolvedColors() {
  const [colors, setColors] = useState({ present: '#22c55e', late: '#eab308', absent: '#ef4444', text: '#6b7280' });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setColors({
      present: styles.getPropertyValue(COLOR_VARS.present).trim() || '#22c55e',
      late: styles.getPropertyValue(COLOR_VARS.late).trim() || '#eab308',
      absent: styles.getPropertyValue(COLOR_VARS.absent).trim() || '#ef4444',
      text: styles.getPropertyValue('--color-text-primary').trim() || '#6b7280',
    });
  }, []);

  return colors;
}

const SHORT_DAYS: Record<string, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('es-PE', opts)} - ${e.toLocaleDateString('es-PE', opts)}`;
}

function BarBackground(props: any) {
  const { x, y, width, height, background } = props;
  const fullHeight = background?.height ?? height;
  const fullY = y + height - fullHeight;
  return (
    <rect
      x={x}
      y={fullY}
      width={width}
      height={fullHeight}
      rx={6}
      ry={6}
      fill="var(--bg-card)"
    />
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 bg-surface border border-border shadow-lg">
      <p className="text-sm font-bold text-text-primary mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-bold text-text-primary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function WeeklyAttendanceChart({ weeklyStats, loading }: WeeklyAttendanceChartProps) {
  const colors = useResolvedColors();

  if (loading) {
    return (
      <Card padding="lg" className="h-full">
        <div className="h-6 w-48 bg-card animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-36 bg-card animate-pulse rounded-lg mb-8" />
        <div className="h-64 bg-card animate-pulse rounded-xl" />
      </Card>
    );
  }

  if (!weeklyStats) {
    return (
      <Card padding="lg" className="h-full flex items-center justify-center min-h-[300px]">
        <p className="text-text-secondary opacity-60">No hay datos disponibles</p>
      </Card>
    );
  }

  const chartData = weeklyStats.days.map((day) => ({
    name: SHORT_DAYS[day.day_name] || day.day_name,
    fullName: day.day_name,
    Presente: day.present,
    Tardanza: day.late,
    Ausente: day.absent + day.justified,
  }));

  return (
    <Card padding="lg" className="h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-text-primary">
          Asistencia Semanal
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          {formatDateRange(weeklyStats.week_start, weeklyStats.week_end)}
        </p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barCategoryGap="15%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 18, fontWeight: 1000, fill: colors.text }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="Presente" fill={colors.present} radius={[6, 6, 0, 0]} maxBarSize={32} background={<BarBackground />} />
            <Bar dataKey="Tardanza" fill={colors.late} radius={[6, 6, 0, 0]} maxBarSize={32} background={<BarBackground />} />
            <Bar dataKey="Ausente" fill={colors.absent} radius={[6, 6, 0, 0]} maxBarSize={32} background={<BarBackground />} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { label: 'Presente', color: colors.present },
          { label: 'Tardanza', color: colors.late },
          { label: 'Ausente', color: colors.absent },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-lg font-bold text-text-secondary">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
