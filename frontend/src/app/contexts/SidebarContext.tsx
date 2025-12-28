'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    isMobile: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);

            if (mobile && isOpen) {
                setIsOpen(false);
            }
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            const savedState = localStorage.getItem('sidebarOpen');
            if (savedState !== null) {
                setIsOpen(savedState === 'true');
            }
        }
    }, [isMobile]);

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);

        if (!isMobile) {
            localStorage.setItem('sidebarOpen', String(newState));
        }
    };

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar debe usarse dentro de SidebarProvider');
    }
    return context;
}