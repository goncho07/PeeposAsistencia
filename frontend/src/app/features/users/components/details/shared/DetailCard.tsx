import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
  return (
    <div className="rounded-xl p-6 bg-background border border-border">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-primary dark:text-primary-light" />
        <h3 className="text-xl font-semibold text-text-primary">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
