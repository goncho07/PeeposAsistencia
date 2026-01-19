import { LucideIcon } from 'lucide-react';

interface ScannerModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function ScannerModeCard({
  icon: Icon,
  title,
  description,
  onClick,
}: ScannerModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all duration-200 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:border-primary dark:hover:border-primary-light hover:-translate-y-1 hover:shadow-lg active:scale-98"
    >
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-all duration-200 group-hover:scale-105">
          <Icon
            size={48}
            className="md:w-16 md:h-16 text-primary dark:text-primary-light"
          />
        </div>
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
        {title}
      </h2>
      <p className="text-sm md:text-base text-text-secondary dark:text-text-secondary-dark">
        {description}
      </p>
    </button>
  );
}
