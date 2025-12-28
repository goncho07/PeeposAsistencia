'use client';
import { useTenant } from '@/app/contexts/TenantProvider';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenuButton } from './MobileMenuButton';

export function Header() {
  const { tenant } = useTenant();

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-header-mobile-left">
          <MobileMenuButton />
        </div>

        <div className="app-header-brand">
          <div className="app-header-info">
            {/* <h1 className="app-header-name">{tenant?.name || 'Institución'}</h1>
            {tenant?.ugel && (
              <span className="app-header-badge">UGEL {tenant.ugel}</span>
            )} */}
          </div>
        </div>

        <div className="app-header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
