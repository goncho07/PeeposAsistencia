'use client';

import { useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Info,
  MoreVertical,
  CheckCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { Incident } from '@/lib/api/incidents';

interface IncidentCardProps {
  incident: Incident;
  onView?: (incident: Incident) => void;
  onResolve?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
}

const severityConfig = {
  LEVE: {
    icon: Info,
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/30',
  },
  MODERADA: {
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
  },
  GRAVE: {
    icon: AlertTriangle,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
  },
};

const statusConfig = {
  REGISTRADA: {
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  EN_SEGUIMIENTO: {
    color: 'text-info',
    bg: 'bg-info/10',
  },
  RESUELTA: {
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

export function IncidentCard({ incident, onView, onResolve, onDelete }: IncidentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const SeverityIcon = severity.icon;

  return (
    <div
      className={`relative p-4 rounded-xl bg-surface dark:bg-surface-dark border-2 ${severity.border} shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${severity.bg}`}>
            <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary dark:text-text-primary-dark">
              {incident.type_label}
            </h4>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
              {incident.severity_label}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-background dark:hover:bg-background-dark transition-colors"
          >
            <MoreVertical size={18} className="text-text-secondary dark:text-text-secondary-dark" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 py-1 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-lg">
                {onView && (
                  <button
                    onClick={() => {
                      onView(incident);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-background dark:hover:bg-background-dark transition-colors text-text-primary dark:text-text-primary-dark"
                  >
                    <Eye size={16} />
                    Ver detalles
                  </button>
                )}
                {onResolve && incident.status !== 'RESUELTA' && (
                  <button
                    onClick={() => {
                      onResolve(incident);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-background dark:hover:bg-background-dark transition-colors text-success"
                  >
                    <CheckCircle size={16} />
                    Resolver
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(incident);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-background dark:hover:bg-background-dark transition-colors text-danger"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background dark:bg-background-dark">
        <User size={16} className="text-text-secondary dark:text-text-secondary-dark" />
        <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
          {incident.student.full_name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-text-secondary dark:text-text-secondary-dark">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} />
          <span>{incident.classroom.full_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{new Date(incident.date).toLocaleDateString('es-PE')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{incident.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span className="truncate">{incident.reporter.full_name}</span>
        </div>
      </div>

      {incident.description && (
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-3 line-clamp-2">
          {incident.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
          {incident.status_label}
        </span>
        {incident.resolved_at && (
          <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
            Resuelto: {new Date(incident.resolved_at).toLocaleDateString('es-PE')}
          </span>
        )}
      </div>
    </div>
  );
}
