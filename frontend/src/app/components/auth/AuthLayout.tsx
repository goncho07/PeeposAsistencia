'use client';
import { ReactNode } from 'react';
import { useTenant } from '@/app/contexts/TenantProvider';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Mail, Lock, ArrowRightCircle, AlertCircle, CheckCircle, LucideIcon } from 'lucide-react';

/* ================================
   AuthLayout principal
================================ */
interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const { tenant, getLogoUrl, getBackgroundUrl } = useTenant();
    const backgroundUrl = getBackgroundUrl();

    return (
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-slate-900 font-['Poppins'] transition-colors">
            {/* Imagen lateral */}
            <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
                {backgroundUrl ? (
                    <img
                        src={backgroundUrl}
                        alt="Fondo institucional"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-400" />
                )}
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" />
            </div>

            {/* Botón tema */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            {/* Panel derecho */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-slate-900 transition-colors">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        {tenant?.logo_url && (
                            <img
                                src={getLogoUrl()}
                                alt={tenant.name}
                                className="mx-auto h-40 mb-6 object-contain transition-transform hover:scale-105 duration-500"
                            />
                        )}
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {title || tenant?.name}
                        </h2>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ================================
   Subcomponentes internos
================================ */

/** 🔹 Alertas */
function Alert({ type = 'error', message }: { type?: 'error' | 'success' | 'warning'; message: string }) {
    const styles =
        type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            : type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${styles}`}>
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

/** 🔹 Input */
function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled,
    icon: Icon,
}: {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    icon?: LucideIcon;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-${Icon ? '10' : '4'} pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    required
                />
            </div>
        </div>
    );
}

/** 🔹 Botón */
function Button({ loading, children }: { loading?: boolean; children: ReactNode }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                </>
            ) : (
                <>
                    {children} <ArrowRightCircle size={20} />
                </>
            )}
        </button>
    );
}

/* ================================
   Exportar subcomponentes agrupados
================================ */
AuthLayout.Alert = Alert;
AuthLayout.Input = Input;
AuthLayout.Button = Button;

export default AuthLayout;
