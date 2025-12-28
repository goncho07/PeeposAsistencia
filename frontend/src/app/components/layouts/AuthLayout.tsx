'use client';
import { useTenant } from '@/app/contexts/TenantProvider';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useTenantMetadata } from '@/app/hooks/useTenantMetadata';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle = "Iniciar Sesión" }: AuthLayoutProps) {
    const { tenant, loading, error, getLogoUrl, getBannerUrl, getBackgroundUrl } = useTenant();
    const { theme } = useTheme();

    useTenantMetadata();

    if (loading) {
        return null;
    }

    if (error || !tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="card max-w-md w-full text-center">
                    <div style={{ color: 'var(--color-danger)' }} className="mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{error || 'Institución no encontrada'}</p>
                </div>
            </div>
        );
    }

    const backgroundUrl = getBackgroundUrl();
    const bannerUrl = getBannerUrl(theme);
    const logoUrl = getLogoUrl();

    return (
        <div className="auth-split-container">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="auth-split-left">
                <div
                    className="auth-split-background"
                    style={{
                        backgroundImage: backgroundUrl
                            ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundUrl})`
                            : `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`
                    }}
                >
                </div>
            </div>

            <div className="auth-split-right">
                <div className="auth-split-content">
                    <div className="auth-header">
                        {bannerUrl ? (
                            <img src={bannerUrl} alt={tenant.name} className="auth-banner" />
                        ) : logoUrl ? (
                            <img src={logoUrl} alt={tenant.name} className="auth-logo" />
                        ) : null}

                        <h1 className="auth-institution-name">{tenant.name}</h1>
                        {title && <h2 className="auth-title">{title}</h2>}
                        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
                    </div>

                    <div className="auth-form-wrapper">
                        {children}
                    </div>

                    <div className="auth-footer">
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            © {new Date().getFullYear()} {tenant.name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}