'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
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
          className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
          aria-label="Menú de usuario"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {getInitials(user.name)}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-text-primary dark:text-text-primary-dark max-w-[120px] truncate">
            {user.name.split(' ')[0]}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark truncate">
                {user.name}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark truncate">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navegar a Mi Perfil
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
              >
                <User size={18} className="text-text-secondary dark:text-text-secondary-dark" />
                Mi Perfil
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navegar a Configuración
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary dark:text-text-primary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors"
              >
                <Settings size={18} className="text-text-secondary dark:text-text-secondary-dark" />
                Configuración
              </button>
            </div>

            <div className="border-t border-border dark:border-border-dark py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={18} />
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
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-danger/10">
                <LogOut size={32} className="text-danger" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
                ¿Cerrar sesión?
              </h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                Tu sesión actual será terminada y tendrás que iniciar sesión nuevamente.
              </p>
            </div>

            <div className="p-4 flex gap-3 bg-background dark:bg-background-dark">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark bg-surface dark:bg-surface-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 bg-danger hover:bg-red-700 text-white"
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
