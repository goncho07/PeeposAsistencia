'use client';
import { useSidebar } from '@/app/contexts/SidebarContext';
import { useTenant } from '@/app/contexts/TenantContext';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FileText, Settings, QrCode, Building2, Home, AlertTriangle } from 'lucide-react';

const MENU_ITEMS = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Users, label: 'Usuarios', href: '/usuarios' },
  { icon: QrCode, label: 'Escáner', href: '/escaner' },
  { icon: AlertTriangle, label: 'Incidencias', href: '/incidencias' },
  { icon: FileText, label: 'Reportes', href: '/reportes' },
  { icon: Settings, label: 'Config', href: '/configuracion' },
] as const;

export function Sidebar() {
  const { isOpen, isMobile, close } = useSidebar();
  const { tenant, getLogoUrl } = useTenant();

  const pathname = usePathname();
  const router = useRouter();

  const logoUrl = getLogoUrl();
  const isActive = (href: string) => pathname === `/${tenant?.slug}${href}`;

  const handleNavigation = (href: string) => {
    router.push(`/${tenant?.slug}${href}`);
    if (isMobile) close();
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-200"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-surface dark:bg-surface-dark
          border-r border-border dark:border-border-dark
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'w-72' : 'w-[100px]'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {isMobile ? (
          <MobileHeader logoUrl={logoUrl} tenant={tenant} />
        ) : (
          <DesktopLogo logoUrl={logoUrl} tenantName={tenant?.name} />
        )}

        <nav className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'py-3'}`}>
          <div className={isMobile ? 'space-y-1.5' : 'flex flex-col gap-3'}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return isMobile ? (
                <MobileNavItem
                  key={item.href}
                  icon={Icon}
                  label={item.label}
                  active={active}
                  onClick={() => handleNavigation(item.href)}
                />
              ) : (
                <DesktopNavItem
                  key={item.href}
                  icon={Icon}
                  label={item.label}
                  active={active}
                  onClick={() => handleNavigation(item.href)}
                />
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}

function DesktopLogo({ logoUrl, tenantName }: { logoUrl: string | null; tenantName?: string }) {
  return (
    <div className="w-full py-4 px-3 border-b border-border dark:border-border-dark">
      <div className="flex justify-center">
        {logoUrl ? (
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
            <img src={logoUrl} alt={tenantName || ''} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-18 h-18 rounded-2xl shadow-lg bg-linear-to-br from-primary to-primary-dark" />
        )}
      </div>
    </div>
  );
}

function DesktopNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="w-full flex items-center justify-center relative group">
      <div
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300
          ${active ? 'h-10 bg-primary' : 'h-0 bg-primary group-hover:h-5'}
        `}
      />

      <button
        onClick={onClick}
        className={`
          flex flex-col items-center justify-center py-3 rounded-xl w-[72px]
          transition-all duration-200
          ${active ? 'bg-primary/10' : 'group-hover:bg-primary/10'}
        `}
        aria-label={label}
      >
        <Icon
          size={30}
          strokeWidth={1.8}
          className={`transition-colors duration-200 ${active ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark group-hover:text-primary'}`}
        />
        <span
          className={`
            text-[11px] font-semibold text-center mt-1 transition-colors duration-200
            ${active ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark group-hover:text-primary'}
          `}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

function MobileHeader({ logoUrl, tenant }: { logoUrl: string | null; tenant: any }) {
  return (
    <div className="w-full px-5 py-4 border-b border-border dark:border-border-dark">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={tenant?.name || ''} className="w-14 h-14 object-contain" />
          ) : (
            <Building2 className="w-14 h-14 text-primary dark:text-primary-light" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="font-black text-[15px] leading-tight line-clamp-2 text-text-primary dark:text-text-primary-dark">
            {tenant?.name || 'Institución'}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {tenant?.ugel && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-primary/10 border-primary/20 text-primary dark:text-primary-light">
                UGEL {tenant.ugel}
              </span>
            )}
            {tenant?.code && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-primary/10 border-primary/20 text-primary dark:text-primary-light">
                {tenant.code}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-xl transition-all duration-200 group flex items-center gap-3.5 px-4 py-3
        ${active ? 'bg-primary/10' : 'hover:bg-surface-hover dark:hover:bg-surface-hover-dark'}
      `}
      aria-label={label}
    >
      <Icon
        size={22}
        strokeWidth={2.5}
        className={`transition-colors ${active ? 'text-primary' : 'text-text-secondary dark:text-text-secondary-dark group-hover:text-primary'}`}
      />
      <span className={`font-semibold text-sm ${active ? 'text-primary' : 'text-text-primary dark:text-text-primary-dark'}`}>
        {label}
      </span>
    </button>
  );
}

