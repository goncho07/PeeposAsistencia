'use client';
import { CheckCircle2, AlertCircle, AlertTriangle, UserCheck, Bell, MessageSquareWarning } from 'lucide-react';
import { BehaviorStatistics } from '@/lib/api/reports';

interface BehaviorKPIsProps {
  stats: BehaviorStatistics;
}

export function BehaviorKPIs({ stats }: BehaviorKPIsProps) {
  const cards = [
    {
      title: 'Asistencia Óptima',
      value: stats.optimal,
      subtext: 'Sin faltas registradas',
      mainIcon: CheckCircle2,
      bgIcon: UserCheck,
      colorClass: 'text-success',
      bgLight: 'bg-success/30',
      borderColor: 'border-success/30',
    },
    {
      title: 'Alerta Preventiva',
      value: stats.preventive_alert,
      subtext: '1 a 3 faltas',
      mainIcon: AlertCircle,
      bgIcon: Bell,
      colorClass: 'text-warning',
      bgLight: 'bg-warning/30',
      borderColor: 'border-warning/30',
    },
    {
      title: 'Citación Requerida',
      value: stats.citation_required,
      subtext: 'Más de 3 faltas',
      mainIcon: AlertTriangle,
      bgIcon: MessageSquareWarning,
      colorClass: 'text-danger',
      bgLight: 'bg-danger/30',
      borderColor: 'border-danger/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => {
        const MainIcon = card.mainIcon;
        const BgIcon = card.bgIcon;

        return (
          <div
            key={index}
            className={`relative overflow-hidden group p-5 rounded-2xl border-2 ${card.borderColor} bg-surface dark:bg-surface-dark shadow-sm`}
          >
            <div className={`absolute inset-0 opacity-[0.08] bg-current ${card.colorClass}`} />

            <div
              className={`absolute -right-4 -bottom-4 opacity-10 dark:opacity-15 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 ${card.colorClass}`}
            >
              <BgIcon size={120} strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className={`inline-flex p-2.5 rounded-xl ${card.bgLight} ${card.colorClass} mb-3 w-fit shadow-sm`}>
                <MainIcon size={24} strokeWidth={2.5} />
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mb-1">
                {card.title}
              </h3>

              <span className={`text-3xl font-extrabold tracking-tight ${card.colorClass} mb-1`}>
                {card.value}
              </span>

              <p className="text-xs text-text-secondary dark:text-text-secondary-dark opacity-70">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
