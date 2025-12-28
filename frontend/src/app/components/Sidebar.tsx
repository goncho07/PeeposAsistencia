'use client';
import { useSidebar } from '@/app/contexts/SidebarContext';
import { useTenant } from '@/app/contexts/TenantProvider';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  Settings,
  LogOut,
  QrCode,
  Building2,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import apiClient from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard' },
  { icon: Users, label: 'Usuarios', href: '/usuarios' },
  { icon: QrCode, label: 'Escáner', href: '/escaner' },
  { icon: FileText, label: 'Reportes', href: '/reportes' },
  { icon: Settings, label: 'Config', href: '/configuracion' },
];

export function Sidebar() {
  const { isOpen, isMobile, close } = useSidebar();
  const { tenant, getLogoUrl } = useTenant();
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'user=; path=/; max-age=0';

      router.push(`/${tenant?.slug}/login`);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(`/${tenant?.slug}${href}`);
    if (isMobile) {
      close();
    }
  };

  const isActive = (href: string) => {
    const fullPath = `/${tenant?.slug}${href}`;
    return pathname === fullPath;
  };

  const logoUrl = getLogoUrl();

  return (
    <>
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="app-sidebar-overlay"
          onClick={close}
        />
      )}

      <aside className={`app-sidebar ${isMobile ? 'app-sidebar-mobile' : ''} ${isMobile && isOpen ? 'app-sidebar-mobile-open' : ''}`}>
        {!isMobile && (
          <div className="w-full py-4 px-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col items-center gap-3">
              {logoUrl ? (
                <div className="relative group">
                  <div
                    className="w-20 h-20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                  >
                    <img
                      src={logoUrl}
                      alt={tenant?.name || ''}
                      className="app-sidebar-logo-img"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, black) 100%)'
                  }}
                >
                </div>
              )}
            </div>
          </div>
        )}

        {isMobile && (
          <div className="w-full px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100 dark:border-white/10 transition-transform active:scale-95">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={tenant?.name || ''}
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <div>
                      <Building2 className="w-14 h-14" style={{ stroke: 'var(--color-primary)' }} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h2
                  className="font-black text-[15px] leading-tight line-clamp-2 wrap-break-word "
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {tenant?.name || 'Institución'}
                </h2>

                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {tenant?.ugel && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      UGEL {tenant.ugel}
                    </span>
                  )}
                  {tenant?.code && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      {tenant.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'w-full px-3 py-4'}`}>
          <div className={isMobile ? 'space-y-1.5' : 'flex flex-col gap-2'}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full rounded-xl transition-all duration-200 group relative overflow-hidden
                    ${isMobile
                      ? 'flex items-center gap-3.5 px-4 py-3'
                      : 'flex flex-col items-center justify-center gap-2 py-4 px-2'
                    }
                    ${active
                      ? 'shadow-md'
                      : ''
                    }
                  `}
                  style={{
                    backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                  }}
                  aria-label={item.label}
                >
                  {active && (
                    <motion.div
                      layoutId={isMobile ? "sidebar-active-mobile" : "sidebar-active"}
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 90%, black) 100%)'
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {!active && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    />
                  )}

                  <div className={`relative z-10 ${isMobile ? 'shrink-0' : ''}`}>
                    <Icon
                      size={isMobile ? 22 : 24} 
                      strokeWidth={2.5}
                      className="transition-all"
                      style={{
                        color: active ? 'white' : 'var(--color-text-secondary)',
                      }}
                    />
                  </div>
                  <span
                    className={`relative z-10 font-semibold transition-all ${isMobile ? 'text-sm' : 'text-[11px] text-center leading-tight'}`}
                    style={{
                      color: active ? 'white' : 'var(--color-text-primary)',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className={`border-t ${isMobile ? 'px-4 py-2' : 'w-full px-4 py-1'}`} style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`
              w-full rounded-xl transition-all duration-200 group relative overflow-hidden
              ${isMobile
                ? 'flex items-center gap-3.5 px-4 py-3'
                : 'flex flex-col items-center justify-center gap-2 py-4 px-2'
              }
            `}
            aria-label="Cerrar sesión"
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/10" />

            <div className={`relative z-10 ${isMobile ? 'shrink-0' : ''}`}>
              <LogOut
                size={isMobile ? 22 : 24}
                strokeWidth={2.5}
                style={{ color: 'var(--color-danger)' }}
                className="transition-transform group-hover:scale-110"
              />
            </div>
            <span className={`relative z-10 font-semibold ${isMobile ? 'text-sm' : 'text-[11px] text-center leading-tight'}`} style={{ color: 'var(--color-danger)' }}>
              {isMobile ? 'Cerrar Sesión' : 'Salir'}
            </span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 "
              onClick={() => !loggingOut && setShowLogoutConfirm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div
                  className="w-22 h-22 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <LogOut size={36} style={{ stroke: 'var(--color-danger)' }} />
                </div>
                <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  ¿Cerrar sesión?
                </h3>
                <p className="text-md" style={{ color: 'var(--color-text-secondary)' }}>
                  Tu sesión actual será terminada y tendrás que iniciar sesión nuevamente.
                </p>
              </div>

              <div className="p-5 flex gap-3" style={{ backgroundColor: 'var(--color-background)' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 bg-red-600 hover:bg-red-700 text-slate-100"
                  style={{
                    border: '2px solid var(--color-danger)',
                  }}
                >
                  {loggingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Cerrando...
                    </span>
                  ) : (
                    'Cerrar Sesión'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
