'use client';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { useTenantMetadata } from '@/app/hooks/useTenantMetadata';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useTenantMetadata();

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content-v2">
        <Header />

        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}