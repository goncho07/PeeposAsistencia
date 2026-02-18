'use client';

import {
  AlertTriangle,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { Incident } from '@/lib/api/incidents';

interface IncidentListProps {
  incidents: Incident[];
  isLoading: boolean;
}

function StudentAvatar({ student }: { student: Incident['student'] }) {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-background border-2 border-border shrink-0">
      {student.photo_url ? (
        <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
      ) : (
        <User className="w-7 h-7 text-text-secondary" />
      )}
    </div>
  );
}

function MobileCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-card animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-card animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-card animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-card animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full">
      <div className="block lg:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <MobileCardSkeleton key={i} />
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left px-4 py-3 w-[35%]">
                  <div className="h-5 w-24 bg-card animate-pulse rounded" />
                </th>
                <th className="text-left px-4 py-3 w-[30%]">
                  <div className="h-5 w-20 bg-card animate-pulse rounded" />
                </th>
                <th className="text-left px-4 py-3 w-[20%]">
                  <div className="h-5 w-20 bg-card animate-pulse rounded" />
                </th>
                <th className="text-left px-4 py-3 w-[15%]">
                  <div className="h-5 w-24 bg-card animate-pulse rounded" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-card animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-40 bg-card animate-pulse rounded" />
                        <div className="h-4 w-24 bg-card animate-pulse rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-card animate-pulse rounded" />
                      <div className="h-4 w-16 bg-card animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-card animate-pulse rounded" />
                      <div className="h-3 w-14 bg-card animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-card animate-pulse rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="w-16 h-16 mb-4 opacity-30 text-text-secondary" />
      <h3 className="text-lg font-semibold mb-2 text-text-primary">
        No hay incidencias registradas
      </h3>
      <p className="text-sm text-text-secondary max-w-sm">
        No se encontraron incidencias con los filtros seleccionados. Intenta
        ajustar los filtros o registra una nueva incidencia.
      </p>
    </div>
  );
}

function MobileIncidentCard({ incident }: { incident: Incident }) {

  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="flex gap-3">
        <StudentAvatar student={incident.student} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary truncate">
              {incident.student.full_name}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-text-primary">{incident.type_label}</span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(incident.date).toLocaleDateString('es-PE')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{incident.time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (incidents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <div className="block lg:hidden space-y-3">
        {incidents.map((incident) => (
          <MobileIncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-primary/5">
                  <th className="text-left px-4 py-3 text-base font-semibold uppercase tracking-wider text-text-secondary w-[35%]">
                    Estudiante
                  </th>
                  <th className="text-left px-4 py-3 text-base font-semibold uppercase tracking-wider text-text-secondary w-[30%]">
                    Incidencia
                  </th>
                  <th className="text-left px-4 py-3 text-base font-semibold uppercase tracking-wider text-text-secondary w-[20%]">
                    Fecha / Hora
                  </th>
                  <th className="text-left px-4 py-3 text-base font-semibold uppercase tracking-wider text-text-secondary w-[15%]">
                    Reporte Por
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  return (
                    <tr
                      key={incident.id}
                      className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <StudentAvatar student={incident.student} />
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-text-primary truncate">
                              {incident.student.full_name}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {incident.classroom.full_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-base font-medium text-text-primary truncate">
                            {incident.type_label}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-text-secondary shrink-0" />
                            <span className="text-base text-text-primary">
                              {new Date(incident.date).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-text-secondary shrink-0" />
                            <span className="text-sm text-text-secondary">{incident.time}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-base text-text-secondary truncate block">
                          {incident.reporter.full_name}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
