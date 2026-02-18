'use client';
import { SidebarProvider } from '../contexts/SidebarContext';

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}
