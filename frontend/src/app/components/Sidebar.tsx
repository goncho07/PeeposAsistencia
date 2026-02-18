'use client';
import { useSidebar } from '@/app/contexts/SidebarContext';
import { useTenant } from '@/app/contexts/TenantContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { buildTenantPath } from '@/lib/axios';
import { getMenuItems } from '@/lib/auth/permissions';

export function Sidebar() {
  const { isOpen, isMobile, close } = useSidebar();
  const { tenant, getLogoUrl } = useTenant();
  const { user } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  const logoUrl = getLogoUrl();
  const menuItems = getMenuItems(user?.role);
  
  const isActive = (href: string) => {
    const target = buildTenantPath(href, tenant?.slug);
    return pathname === target || pathname.endsWith(href);
  };

  const handleNavigation = (href: string) => {
    const target = buildTenantPath(href, tenant?.slug);
    router.push(target);
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
          ${isMobile ? 'w-72' : 'w-[108px]'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {isMobile ? (
          <MobileHeader logoUrl={logoUrl} tenant={tenant} />
        ) : (
          <DesktopLogo logoUrl={logoUrl} tenantName={tenant?.name} />
        )}

        <nav className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'py-6'}`}>
          <div className={isMobile ? 'space-y-1.5' : 'flex flex-col gap-5'}>
            {menuItems.map((item) => {
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
    <div className="w-full py-5 px-3 border-b border-border dark:border-border-dark">
      <div className="flex justify-center">
        {logoUrl ? (
          <div className="w-15 h-15 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
            <img src={logoUrl} alt={tenantName || ''} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-15 h-15 rounded-2xl shadow-lg bg-linear-to-br from-primary to-primary-dark" />
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
          absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300
          ${active ? 'h-12 bg-primary' : 'h-0 bg-primary group-hover:h-6'}
        `}
      />

      <button
        onClick={onClick}
        className={`
          flex flex-col items-center justify-center py-3.5 rounded-2xl w-[88px]
          transition-all duration-200 cursor-pointer
          ${active ? 'bg-primary/10 text-primary' : 'text-text-secondary dark:text-text-secondary-dark hover:bg-primary/5 hover:text-primary'}
        `}
        aria-label={label}
      >
        <Icon
          size={34}
          strokeWidth={active ? 2 : 1.7}
          className="transition-colors duration-200"
        />
        <span
          className="text-[13px] font-bold text-center mt-1.5 transition-colors duration-200 leading-none"
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
      <div className="flex items-center gap-4">
        <div className="w-18 h-18 rounded-xl flex items-center justify-center overflow-hidden bg-background shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={tenant?.name || ''} className="w-16 h-16 object-contain" />
          ) : (
            <Building2 className="w-16 h-16 text-primary dark:text-primary-light" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-black text-lg leading-tight line-clamp-2 text-text-primary dark:text-text-primary-dark">
            {tenant?.name || 'Institución'}
          </h2>
          {tenant?.ugel && (
            <span className="inline-block mt-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border bg-primary/10 border-primary/20 text-primary">
              UGEL {tenant.ugel}
            </span>
          )}
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
        w-full rounded-2xl transition-all duration-200 group flex items-center gap-4 px-5 py-4 cursor-pointer
        ${active ? 'bg-primary/10 text-primary' : 'text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'}
      `}
      aria-label={label}
    >
      <Icon
        size={28}
        strokeWidth={2.2}
        className="transition-colors"
      />
      <span className="font-bold text-lg">
        {label}
      </span>
    </button>
  );
}