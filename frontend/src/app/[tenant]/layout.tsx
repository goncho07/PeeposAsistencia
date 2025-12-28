'use client';
import { SidebarProvider } from '../contexts/SidebarContext';
import { useTokenValidation } from '../hooks/useTokenValidation';
import { useStorageSync } from '../hooks/useStorageSync';

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    useTokenValidation();

    useStorageSync();

    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}
