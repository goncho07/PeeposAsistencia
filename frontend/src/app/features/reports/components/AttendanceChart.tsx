'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface AttendanceChartProps {
  data: ChartDataItem[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-4 mb-4 relative overflow-hidden rounded-2xl border border-border bg-surface dark:bg-surface-dark shadow-sm">
      <div className="absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 p-5 border-b border-border dark:border-border-dark bg-background">
        <div className="flex items-center gap-3">
          <div className="inline-flex p-2.5 rounded-xl bg-primary/10 text-primary dark:text-primary-light">
            <PieChartIcon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary dark:text-text-primary-dark">
              Distribución de Asistencia
            </h3>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
              Resumen del período seleccionado
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="relative" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-text-primary dark:text-text-primary-dark">
              {total}
            </span>
            <span className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {data.map((d) => {
            const percentage = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';

            return (
              <div key={d.name} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm font-semibold text-text-secondary dark:text-text-secondary-dark">
                    {d.name}
                  </span>
                </div>
                <div className="ml-5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                    {d.value}
                  </span>
                  <span className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
