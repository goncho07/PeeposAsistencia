import { LucideIcon } from 'lucide-react';

interface ScanTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'success' | 'warning';
  onClick: () => void;
}

export function ScanTypeCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: ScanTypeCardProps) {
  const colorClasses = {
    success: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success',
      hoverBorder: 'hover:border-success',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning',
      hoverBorder: 'hover:border-warning',
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 bg-surface dark:bg-surface-dark border-2 border-transparent ${colors.hoverBorder} hover:-translate-y-1 hover:shadow-lg active:scale-98`}
    >
      <div className="flex justify-center mb-6">
        <div
          className={`w-24 h-24 md:w-42 md:h-42 rounded-full flex items-center justify-center ${colors.bg} group-hover:scale-105 transition-transform duration-200`}
        >
          <Icon size={48} className={`md:w-22 md:h-22 ${colors.text}`} />
        </div>
      </div>
      <h2 className={`text-2xl md:text-4xl font-bold mb-2 ${colors.text}`}>
        {title}
      </h2>
      <p className="text-sm md:text-xl text-text-secondary dark:text-text-secondary-dark">
        {description}
      </p>
    </button>
  );
}
