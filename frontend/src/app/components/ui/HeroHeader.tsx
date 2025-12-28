'use client';
import { LucideIcon, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/app/contexts/TenantProvider';

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
  breadcrumbs = []
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
    ...breadcrumbs
  ];

  return (
    <div className="page-header-modern">
      {defaultBreadcrumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumbs-list">
            {defaultBreadcrumbs.map((crumb, index) => {
              const isLast = index === defaultBreadcrumbs.length - 1;
              const CrumbIcon = crumb.icon;

              return (
                <li key={index} className="breadcrumbs-item">
                  {!isLast && crumb.href ? (
                    <>
                      <button
                        onClick={() => handleBreadcrumbClick(crumb.href)}
                        className="breadcrumb-link"
                        aria-label={`Ir a ${crumb.label}`}
                      >
                        {CrumbIcon && <CrumbIcon size={14} />}
                        <span>{crumb.label}</span>
                      </button>
                      <ChevronRight size={14} className="breadcrumb-separator" />
                    </>
                  ) : (
                    <span className="breadcrumb-current">
                      {CrumbIcon && <CrumbIcon size={14} />}
                      <span>{crumb.label}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="page-header-content">
        <div className="page-header-icon">
          <Icon size={24} strokeWidth={2} />
        </div>
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
