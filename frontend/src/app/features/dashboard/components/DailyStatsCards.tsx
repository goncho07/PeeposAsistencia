'use client';
import { CheckCircle2, XCircle, Clock, BarChart3, Timer, LineChart, UserX, UserCheck } from 'lucide-react';
import { DailyStats } from '../hooks/useDailyStats';

interface DailyStatsCardsProps {
  stats: DailyStats | null;
  loading: boolean;
}

export function DailyStatsCards({ stats, loading }: DailyStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-card animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const totalPresent = stats.students.present + stats.teachers.present;
  const totalLate = stats.students.late + stats.teachers.late;
  const totalAbsent = stats.students.absent + stats.teachers.absent + stats.students.justified;
  const totalRegistered = stats.students.total_registered + stats.teachers.total_registered;
  const attendancePercentage = totalRegistered > 0 ? ((totalPresent + totalLate) / totalRegistered) * 100 : 0;

  const cards = [
    {
      title: 'Asistencias',
      value: totalPresent,
      mainIcon: CheckCircle2,
      bgIcon: UserCheck,
      colorClass: 'text-success',
      bgLight: 'bg-success/30',
      borderColor: 'border-success/30',
    },
    {
      title: 'Inasistencias',
      value: totalAbsent,
      mainIcon: XCircle,
      bgIcon: UserX,
      colorClass: 'text-danger',
      bgLight: 'bg-danger/30',
      borderColor: 'border-danger/30',
    },
    {
      title: 'Tardanzas',
      value: totalLate,
      mainIcon: Clock,
      bgIcon: Timer,
      colorClass: 'text-warning',
      bgLight: 'bg-warning/30',
      borderColor: 'border-warning/30',
    },
    {
      title: 'Porcentaje',
      value: `${attendancePercentage.toFixed(1)}%`,
      mainIcon: BarChart3,
      bgIcon: LineChart,
      colorClass: 'text-primary',
      bgLight: 'bg-primary/30',
      borderColor: 'border-primary/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const MainIcon = card.mainIcon;
        const BgIcon = card.bgIcon;

        return (
          <div
            key={index}
            className={`relative overflow-hidden group p-6 rounded-2xl border-2 ${card.borderColor} bg-surface shadow-sm`}
          >
            <div className={`absolute inset-0 opacity-[0.10] bg-current ${card.colorClass}`} />

            <div className={`absolute -right-6 -bottom-6 opacity-10 dark:opacity-20 transition-transform duration-2000 ease-out group-hover:scale-125 group-hover:-rotate-6 ${card.colorClass}`}>
              <BgIcon size={140} strokeWidth={1.75} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className={`inline-flex p-3 rounded-2xl ${card.bgLight} ${card.colorClass} mb-4 shadow-sm`}>
                  <MainIcon size={28} strokeWidth={2.5} />
                </div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                  {card.title}
                </h3>
              </div>

              <div className="mt-2">
                <span className="text-4xl font-extrabold tracking-tight text-text-secondary">
                  {card.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}