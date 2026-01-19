'use client';

import { useState } from 'react';
import { AlertTriangle, List, Plus } from 'lucide-react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import {
  useIncidents,
  IncidentFilters,
  IncidentList,
  IncidentStats,
  IncidentForm,
} from '@/app/features/incidents';

type TabType = 'list' | 'register';

export default function IncidenciasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  const {
    incidents,
    statistics,
    isLoading,
    filters,
    updateFilters,
    deleteIncident,
    refreshIncidents,
  } = useIncidents();

  const handleDelete = async (incident: { id: number }) => {
    if (confirm('¿Estás seguro de eliminar esta incidencia?')) {
      await deleteIncident(incident.id);
    }
  };

  const handleFormSuccess = () => {
    refreshIncidents();
    setActiveTab('list');
  };

  const tabs = [
    {
      id: 'list' as TabType,
      label: 'Ver Incidencias',
      icon: List,
    },
    {
      id: 'register' as TabType,
      label: 'Registrar',
      icon: Plus,
    },
  ];

  return (
    <AppLayout>
      <HeroHeader
        title="Incidencias"
        subtitle="Registro y seguimiento de incidencias estudiantiles"
        icon={AlertTriangle}
        breadcrumbs={[{ label: 'Incidencias', icon: AlertTriangle }]}
      />

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex p-1 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-background dark:hover:bg-background-dark'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'list' && (
        <>
          <IncidentStats statistics={statistics} />

          <div className="flex flex-col lg:flex-row gap-6">
            <IncidentFilters filters={filters} onFiltersChange={updateFilters} />

            <div className="flex-1">
              <IncidentList
                incidents={incidents}
                isLoading={isLoading}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'register' && (
        <IncidentForm onSuccess={handleFormSuccess} />
      )}
    </AppLayout>
  );
}
