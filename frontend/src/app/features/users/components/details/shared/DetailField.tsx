import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface DetailFieldProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  size?: 'sm' | 'xs' | 'md';
  className?: string;
}

export function DetailField({ label, value, icon: Icon, size = 'md', className = '' }: DetailFieldProps) {
  const isXs = size === 'xs';
  const isMd = size === 'md';

  return (
    <div className={clsx('flex flex-col', className)}>
      <div
        className={clsx(
          'flex items-center gap-2 mb-1.5 text-text-secondary dark:text-text-secondary-dark font-medium',
          {
            'text-xs': isXs,
            'text-sm': size === 'sm',
            'text-base': isMd,
          }
        )}
      >
        {Icon && <Icon size={isMd ? 18 : 15} className="text-primary/70 dark:text-primary-light/80" />}
        <span>{label}</span>
      </div>

      <div
        className={clsx(
          'font-semibold text-text-primary dark:text-text-primary-dark leading-snug',
          {
            'text-sm': isXs,
            'text-base': size === 'sm',
            'text-lg': isMd,
          }
        )}
      >
        {value || <span className="text-text-tertiary italic">—</span>}
      </div>
    </div>
  );
}
