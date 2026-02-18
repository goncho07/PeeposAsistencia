'use client';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api/auth';
import { User } from '@/app/contexts/AuthContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { LogOut, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await authService.getUser();
        if (response.user?.role !== 'SUPERADMIN') {
          router.replace('/admin/login');
          return;
        }
        setUser(response.user);
      } catch {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isLoginPage]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      //
    } finally {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-secondary">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center h-16 px-4 lg:px-6 bg-surface border-b border-border">
        <div className="flex items-center gap-3 w-full">
          <span className="text-lg text-text-secondary hidden sm:block">
            {user.email}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={24} />
            </button>
          </div>

        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
