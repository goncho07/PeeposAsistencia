'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, FileWarning } from 'lucide-react';
import { IncidentStatistics } from '@/lib/api/incidents';

interface IncidentStatsProps {
  statistics: IncidentStatistics | null;
}

export function IncidentStats({ statistics }: IncidentStatsProps) {
  if (!statistics) return null;

  const cards = [
    {
      title: 'Total',
      value: statistics.total,
      icon: FileWarning,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Leves',
      value: statistics.by_severity.LEVE,
      icon: Info,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      title: 'Moderadas',
      value: statistics.by_severity.MODERADA,
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Graves',
      value: statistics.by_severity.GRAVE,
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      title: 'Pendientes',
      value: statistics.by_status.REGISTRADA + statistics.by_status.EN_SEGUIMIENTO,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Resueltas',
      value: statistics.by_status.RESUELTA,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="p-4 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  {card.title}
                </p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
