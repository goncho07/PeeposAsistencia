'use client';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { Calendar } from './Calendar';
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

          <div className="flex items-center gap-3">
            <Calendar />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="hidden lg:flex fixed z-50 items-center top-10 right-10 p-2 rounded-3xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-md transition-all duration-200">
        <Calendar />
        <ThemeToggle />
        <UserMenu />
      </div>
    </>
  );
}
