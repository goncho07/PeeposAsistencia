import { LucideIcon } from 'lucide-react';

interface TabHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string;
}

export function TabHeader({
  icon: Icon,
  title,
  description,
  iconBgColor,
}: TabHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border dark:border-border-dark">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}
      >
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {title}
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          {description}
        </p>
      </div>
    </div>
  );
}
