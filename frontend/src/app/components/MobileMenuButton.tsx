'use client';
import { useSidebar } from '@/app/contexts/SidebarContext';
import { Menu } from 'lucide-react';

export function MobileMenuButton() {
    const { isMobile, isOpen, toggle } = useSidebar();

    if (!isMobile || isOpen) return null;

    return (
        <button
            onClick={toggle}
            className="mobile-menu-button"
            aria-label="Abrir menú"
        >
            <Menu size={24} />
        </button>
    );
}