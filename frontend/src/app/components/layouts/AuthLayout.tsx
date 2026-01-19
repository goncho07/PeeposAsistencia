'use client';
import { useTenant } from '@/app/contexts/TenantContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle = 'Iniciar Sesión',
}: AuthLayoutProps) {
  const { tenant, loading, error, getLogoUrl, getBannerUrl, getBackgroundUrl } =
    useTenant();
  const { theme } = useTheme();

  if (loading) {
    return null;
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="rounded-xl shadow-sm p-6 max-w-md w-full text-center bg-surface border border-border">
          <div className="mb-4 text-danger">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-text-primary">
            Error
          </h2>
          <p className="text-text-secondary">
            {error || 'Institución no encontrada'}
          </p>
        </div>
      </div>
    );
  }

  const backgroundUrl = getBackgroundUrl();
  const bannerUrl = getBannerUrl(theme);
  const logoUrl = getLogoUrl();

  return (
    <div className="min-h-screen flex">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center relative flex items-center justify-center"
          style={{
            backgroundImage: backgroundUrl
              ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundUrl})`
              : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-color-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={tenant.name}
                className="max-h-28 w-auto mx-auto mb-8 object-contain"
              />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt={tenant.name}
                className="max-h-28 w-auto mx-auto mb-8 object-contain"
              />
            ) : null}

            <h1 className="text-3xl lg:text-3xl font-bold mb-3 text-text-primary">
              {tenant.name}
            </h1>
            {title && (
              <h2 className="text-xl font-semibold mb-2 text-text-primary">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          <div className="space-y-6">{children}</div>

          <div className="text-center text-xs mt-8">
            <p className="text-text-secondary">
              © {new Date().getFullYear()} {tenant.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}