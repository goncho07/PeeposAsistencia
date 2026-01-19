'use client';

import { AlertTriangle } from 'lucide-react';
import { Incident } from '@/lib/api/incidents';
import { IncidentCard } from './IncidentCard';

interface IncidentListProps {
  incidents: Incident[];
  isLoading: boolean;
  onView?: (incident: Incident) => void;
  onResolve?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
}

function IncidentCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-surface border-2 border-border animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-card" />
          <div>
            <div className="h-4 w-32 bg-card rounded mb-1" />
            <div className="h-3 w-16 bg-card rounded" />
          </div>
        </div>
        <div className="w-7 h-7 rounded-lg bg-card" />
      </div>

      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background">
        <div className="w-4 h-4 rounded bg-card" />
        <div className="h-4 w-40 bg-card rounded" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-3 w-24 bg-card rounded" />
        <div className="h-3 w-20 bg-card rounded" />
        <div className="h-3 w-16 bg-card rounded" />
        <div className="h-3 w-28 bg-card rounded" />
      </div>

      <div className="h-4 w-full bg-card rounded mb-2" />
      <div className="h-4 w-3/4 bg-card rounded mb-3" />

      <div className="h-6 w-20 bg-card rounded-full" />
    </div>
  );
}

export function IncidentList({
  incidents,
  isLoading,
  onView,
  onResolve,
  onDelete,
}: IncidentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <IncidentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-16 h-16 mb-4 opacity-20 text-text-secondary dark:text-text-secondary-dark" />
        <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-text-primary-dark">
          No hay incidencias
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark max-w-sm">
          No se encontraron incidencias con los filtros seleccionados. Intenta ajustar los filtros o
          registra una nueva incidencia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          onView={onView}
          onResolve={onResolve}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
