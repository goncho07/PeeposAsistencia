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
      className="group rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all duration-200 bg-surface border border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg active:scale-98"
    >
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 md:w-42 md:h-42 rounded-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-all duration-200 group-hover:scale-105">
          <Icon
            size={48}
            className="md:w-24 md:h-24 text-primary"
          />
        </div>
      </div>
      <h2 className="text-xl md:text-4xl font-bold mb-2 text-text-primary">
        {title}
      </h2>
      <p className="text-sm md:text-xl text-text-secondary">
        {description}
      </p>
    </button>
  );
}
