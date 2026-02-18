'use client';

import { useState } from 'react';
import {
  AlertTriangle, PlusIcon, Search,
  OctagonAlert,
  FileText,
  TriangleAlert,
} from 'lucide-react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { IncidentCreateModal, IncidentFilters, IncidentList } from '@/app/features/incidents/components';
import { useIncidents } from '@/app/features/incidents/hooks';
import { Button } from '@/app/components/ui/base';
import { UserKPICard } from '@/app/features/users/components/shared';
import { IncidentSeverity } from '@/lib/api/incidents';

type SeverityFilter = IncidentSeverity | 'all';

const SEVERITY_CARDS: {
  key: SeverityFilter;
  title: string;
  icon: typeof AlertTriangle;
  bgIcon: typeof AlertTriangle;
  colorClass: string;
  bgLight: string;
  borderColor: string;
  ringColor: string;
}[] = [
  {
    key: 'all',
    title: 'Total Incidencias',
    icon: FileText,
    bgIcon: FileText,
    colorClass: 'text-primary',
    bgLight: 'bg-primary/30',
    borderColor: 'border-primary/30',
    ringColor: 'ring-primary/30',
  },
  {
    key: 'LEVE',
    title: 'Leves',
    icon: AlertTriangle,
    bgIcon: AlertTriangle,
    colorClass: 'text-warning',
    bgLight: 'bg-warning/30',
    borderColor: 'border-warning/30',
    ringColor: 'ring-warning/30',
  },
  {
    key: 'MODERADA',
    title: 'Moderadas',
    icon: TriangleAlert,
    bgIcon: TriangleAlert,
    colorClass: 'text-secondary',
    bgLight: 'bg-secondary/30',
    borderColor: 'border-secondary/30',
    ringColor: 'ring-secondary/30',
  },
  {
    key: 'GRAVE',
    title: 'Graves',
    icon: OctagonAlert,
    bgIcon: OctagonAlert,
    colorClass: 'text-danger',
    bgLight: 'bg-danger/30',
    borderColor: 'border-danger/30',
    ringColor: 'ring-danger/30',
  },
];

export default function IncidenciasPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    incidents,
    severityCounts,
    isLoading,
    filters,
    searchQuery,
    setSearchQuery,
    updateFilters,
    refreshIncidents,
  } = useIncidents();

  const activeSeverity: SeverityFilter = filters.severity || 'all';

  const handleSeverityClick = (key: SeverityFilter) => {
    if (key === 'all') {
      updateFilters({ ...filters, severity: undefined });
    } else if (filters.severity === key) {
      updateFilters({ ...filters, severity: undefined });
    } else {
      updateFilters({ ...filters, severity: key });
    }
  };

  const getCount = (key: SeverityFilter) => {
    return key === 'all' ? severityCounts.total : severityCounts[key];
  };

  return (
    <AppLayout>
      <HeroHeader
        title="Incidencias"
        subtitle="Registro de incidencias estudiantiles"
        icon={AlertTriangle}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {SEVERITY_CARDS.map((card) => (
          <UserKPICard
            key={card.key}
            title={card.title}
            count={getCount(card.key)}
            icon={card.icon}
            bgIcon={card.bgIcon}
            colorClass={card.colorClass}
            bgLight={card.bgLight}
            borderColor={card.borderColor}
            ringColor={card.ringColor}
            active={activeSeverity === card.key}
            loading={isLoading}
            onClick={() => handleSeverityClick(card.key)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <IncidentFilters filters={filters} onFiltersChange={updateFilters} />
        </div>

        <div className="lg:col-span-3 min-w-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar por estudiante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 text-xl sm:flex-none whitespace-nowrap"
                icon={<PlusIcon size={22} />}
              >
                Registrar Incidencia
              </Button>
            </div>
          </div>

          <IncidentList
            incidents={incidents}
            isLoading={isLoading}
          />
        </div>
      </div>

      <IncidentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshIncidents}
      />
    </AppLayout>
  );
}
