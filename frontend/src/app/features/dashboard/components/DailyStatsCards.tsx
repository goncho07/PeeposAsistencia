'use client';
import { CheckCircle2, XCircle, Clock, Timer, UserX, UserCheck, Building } from 'lucide-react';
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

  const groups = [stats.students, stats.teachers, stats.users].filter(Boolean);
  const totalPresent = groups.reduce((sum, g) => sum + g!.present, 0);
  const totalLate = groups.reduce((sum, g) => sum + g!.late, 0);
  const totalAbsent = groups.reduce((sum, g) => sum + g!.absent + (g!.justified ?? 0), 0);
  const totalRegistered = groups.reduce((sum, g) => sum + g!.total_registered, 0);

  const cards = [
    {
      title: 'Total Institución',
      value: totalRegistered,
      mainIcon: Building,
      bgIcon: Building,
      colorClass: 'text-primary',
      bgLight: 'bg-primary/30',
      borderColor: 'border-primary/30',
    },
    {
      title: 'Total Presentes',
      value: totalPresent,
      mainIcon: CheckCircle2,
      bgIcon: UserCheck,
      colorClass: 'text-success',
      bgLight: 'bg-success/30',
      borderColor: 'border-success/30',
    },
    {
      title: 'Total Tardanzas',
      value: totalLate,
      mainIcon: Clock,
      bgIcon: Timer,
      colorClass: 'text-warning',
      bgLight: 'bg-warning/30',
      borderColor: 'border-warning/30',
    },
    {
      title: 'Total Faltas',
      value: totalAbsent,
      mainIcon: XCircle,
      bgIcon: UserX,
      colorClass: 'text-danger',
      bgLight: 'bg-danger/30',
      borderColor: 'border-danger/30',
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
                  <MainIcon size={32} strokeWidth={2.5} />
                </div>

                <h3 className="text-base font-bold uppercase tracking-widest text-text-primary">
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