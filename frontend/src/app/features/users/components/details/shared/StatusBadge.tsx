interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVO: {
      label: 'Activo',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20',
    },
    INACTIVO: {
      label: 'Inactivo',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20',
    },
    MATRICULADO: {
      label: 'Matriculado',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20',
    },
    RETIRADO: {
      label: 'Retirado',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20',
    },
    TRASLADADO: {
      label: 'Trasladado',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20',
    },
    EGRESADO: {
      label: 'Egresado',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20',
    },
    LICENCIA: {
      label: 'Licencia',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20',
    },
    CESADO: {
      label: 'Cesado',
      className:
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20',
    },
  };

  const config = statusMap[status] || {
    label: status,
    className:
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-border/10 text-text-secondary border border-border',
  };

  return <span className={config.className}>{config.label}</span>;
}
