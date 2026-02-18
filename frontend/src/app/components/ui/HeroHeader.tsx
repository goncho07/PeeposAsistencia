'use client';
import { LucideIcon } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  breadcrumbs?: Breadcrumb[];
}

export function HeroHeader({
  title,
  subtitle,
  icon: Icon,
}: HeroHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="shrink-0 w-15 h-15 rounded-xl flex items-center justify-center bg-primary/10">
          <Icon size={34} strokeWidth={1.8} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary dark:text-text-primary-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}