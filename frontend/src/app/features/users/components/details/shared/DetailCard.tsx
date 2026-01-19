import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
  return (
    <div className="rounded-xl p-6 bg-background border border-border dark:border-border-dark">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-5 h-5 text-primary dark:text-primary-light" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
