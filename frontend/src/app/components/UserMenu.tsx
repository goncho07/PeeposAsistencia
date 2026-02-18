'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTenant } from '@/app/contexts/TenantContext';
import { buildTenantPath } from '@/lib/axios';
import { User, LogOut } from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 rounded-lg transition-all cursor-pointer p-1.5 lg:p-2.5 hover:bg-surface-hover"
          aria-label="Menú de usuario"
        >
          <div className="w-8 h-8 lg:w-11 lg:h-11 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 transition-all">
            <span className="text-xs lg:text-base font-black text-primary">
              {getInitials(user.name)}
            </span>
          </div>

          <span className="hidden sm:block text-sm lg:text-[16px] font-bold text-text-primary dark:text-text-primary-dark max-w-[150px] truncate">
            {user.name.split(' ')[0]}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 lg:w-64 rounded-2xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-2xl overflow-hidden z-50 transition-all">
            <div className="px-5 py-4 border-b border-border dark:border-border-dark bg-primary/5">
              <p className="text-sm lg:text-[15px] font-black text-text-primary dark:text-text-primary-dark truncate">
                {user.name}
              </p>
              <p className="text-xs lg:text-sm text-text-secondary dark:text-text-secondary-dark truncate">
                {user.email}
              </p>
            </div>

            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(buildTenantPath('/perfil', tenant?.slug));
                }}
                className="w-full flex items-center gap-4 px-5 py-3 lg:py-4 text-sm lg:text-[15px] font-bold text-text-primary dark:text-text-primary-dark hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <User size={22} className="text-primary" strokeWidth={2.2} />
                Mi Perfil
              </button>
            </div>

            <div className="border-t border-border dark:border-border-dark py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-4 px-5 py-3 lg:py-4 text-sm lg:text-[15px] font-bold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              >
                <LogOut size={22} strokeWidth={2.2} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 transition-opacity duration-200"
            onClick={() => !loggingOut && setShowLogoutConfirm(false)}
          />

          <div
            className="relative rounded-2xl shadow-2xl max-w-md w-full overflow-hidden bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center border-b border-border dark:border-border-dark">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-danger/10">
                <LogOut size={46} className="text-danger" />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
                ¿Cerrar sesión?
              </h3>
              <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
                Tu sesión actual será terminada y tendrás que iniciar sesión nuevamente.
              </p>
            </div>

            <div className="p-4 flex gap-3 bg-background">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 border border-border text-xl text-text-primary bg-surface hover:bg-surface-hover"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 bg-danger hover:bg-red-700 text-xl text-white"
              >
                {loggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cerrando...
                  </span>
                ) : (
                  'Cerrar Sesión'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}