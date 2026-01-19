'use client';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useSidebar } from '@/app/contexts/SidebarContext';

export function Header() {
  const { isMobile, isOpen, toggle } = useSidebar();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center">
            {isMobile && !isOpen && (
              <button
                onClick={toggle}
                className="p-2 rounded-lg transition-colors hover:bg-surface-hover dark:hover:bg-surface-hover-dark text-text-primary dark:text-text-primary-dark"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="hidden lg:flex fixed top-4 right-6 z-50 items-center gap-2 p-1.5 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
        <ThemeToggle />
        <UserMenu />
      </div>
    </>
  );
}
