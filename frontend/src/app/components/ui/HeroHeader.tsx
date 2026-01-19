'use client';
import { LucideIcon, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/app/contexts/TenantContext';

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
  breadcrumbs = [],
}: HeroHeaderProps) {
  const router = useRouter();
  const { tenant } = useTenant();

  const handleBreadcrumbClick = (href?: string) => {
    if (href) {
      router.push(`/${tenant?.slug}${href}`);
    }
  };

  const defaultBreadcrumbs: Breadcrumb[] = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    ...breadcrumbs,
  ];

  return (
    <div className="mb-6">
      {defaultBreadcrumbs.length > 0 && (
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1.5">
            {defaultBreadcrumbs.map((crumb, index) => {
              const isLast = index === defaultBreadcrumbs.length - 1;
              const CrumbIcon = crumb.icon;

              return (
                <li key={index} className="flex items-center gap-1.5">
                  {!isLast && crumb.href ? (
                    <>
                      <button
                        onClick={() => handleBreadcrumbClick(crumb.href)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105 text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-light hover:bg-primary/10"
                        aria-label={`Ir a ${crumb.label}`}
                      >
                        {CrumbIcon && <CrumbIcon size={15} />}
                        <span>{crumb.label}</span>
                      </button>
                      <ChevronRight
                        size={15}
                        className="text-border dark:text-border-dark"
                      />
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-semibold rounded-lg text-primary dark:text-primary-light bg-primary/10">
                      {CrumbIcon && <CrumbIcon size={15} />}
                      <span>{crumb.label}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-primary/10">
          <Icon size={28} strokeWidth={1.8} className="text-primary" />
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
