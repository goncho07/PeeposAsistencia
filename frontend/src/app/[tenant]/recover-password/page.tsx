'use client';
import { useState } from 'react';
import { useTenant } from '@/app/contexts/TenantProvider';
import { AuthLayout } from '@/app/components/layouts/AuthLayout';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarPasswordPage() {
    const { tenant } = useTenant();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Aquí iría tu lógica de recuperación de contraseña
            // await authService.requestPasswordReset(email);

            // Simulación
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar el correo de recuperación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar Contraseña"
            subtitle="Te enviaremos un enlace para restablecer tu contraseña"
        >
            {success ? (
                <div className="text-center">
                    <div className="alert-success mb-6">
                        ✓ Correo enviado exitosamente. Revisa tu bandeja de entrada.
                    </div>
                    <Link
                        href={`/${tenant?.slug}/login`}
                        className="btn-auth"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver al inicio de sesión</span>
                    </Link>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="alert-error mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="form-group">
                            <label htmlFor="email" className="label">
                                Correo Electrónico
                            </label>
                            <div className="input-with-icon">
                                <Mail className="input-icon" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input"
                                    placeholder="correo@ejemplo.com"
                                    autoComplete="email"
                                />
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                                Ingresa el correo asociado a tu cuenta
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-auth"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    <span>Enviar Enlace de Recuperación</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={`/${tenant?.slug}/login`}
                            className="auth-link inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Volver al inicio de sesión</span>
                        </Link>
                    </div>
                </>
            )}
        </AuthLayout>
    );
}