import { LucideIcon } from 'lucide-react';

interface DetailFieldProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  size?: 'sm' | 'xs';
  className?: string;
}

export function DetailField({ label, value, icon: Icon, size = 'sm', className = '' }: DetailFieldProps) {
  const textSize = size === 'xs' ? 'text-xs' : 'text-sm';

  return (
    <div className={className}>
      <div className={`flex items-center gap-1.5 text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1`}>
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <div className={`${textSize} font-medium text-text-primary dark:text-text-primary-dark`}>
        {value}
      </div>
    </div>
  );
}
