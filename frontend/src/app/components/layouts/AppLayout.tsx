'use client';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Unauthorized } from '../ui/Unauthorized';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTenant } from '@/app/contexts/TenantContext';
import { useParams, usePathname } from 'next/navigation';
import { buildTenantPath } from '@/lib/axios';
import { hasAccess } from '@/lib/auth/permissions';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { loading: tenantLoading } = useTenant();
  const params = useParams();
  const pathname = usePathname();
  const urlSlug = params.tenant as string;

  useEffect(() => {
    if (isLoading || tenantLoading) return;

    if (!isAuthenticated) {
      window.location.replace(buildTenantPath('/login'));
      return;
    }

    if (user?.tenant?.slug && user.tenant.slug !== urlSlug) {
      logout();
      return;
    }
  }, [isAuthenticated, isLoading, tenantLoading, user?.tenant?.slug, urlSlug, logout]);

  if (isLoading || tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.tenant?.slug && user.tenant.slug !== urlSlug) {
    return null;
  }

  const authorized = hasAccess(user?.role, pathname);

  return (
    <div className="flex min-h-screen overflow-x-hidden max-w-screen w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 lg:ml-[100px] overflow-x-hidden max-w-full w-full">
        <Header />

        <div className="flex-1 p-4 sm:p-6 lg:px-10 lg:pt-6 lg:pb-14 overflow-x-hidden max-w-full w-full box-border">
          {authorized ? children : <Unauthorized />}
        </div>
      </main>
    </div>
  );
}
