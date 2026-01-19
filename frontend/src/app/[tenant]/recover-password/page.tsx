'use client';
import { useState } from 'react';
import { useTenant } from '@/app/contexts/TenantContext';
import { AuthLayout } from '@/app/components/layouts/AuthLayout';
import { Input, Button } from '@/app/components/ui/base';
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
            //

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
                    <div className="px-4 py-3 rounded-lg text-sm font-medium border mb-6 bg-success/10 text-success border-success/20">
                        Correo enviado exitosamente. Revisa tu bandeja de entrada.
                    </div>
                    <Button
                        variant="primary"
                        icon={<ArrowLeft size={20} />}
                        className="w-full"
                        onClick={() => window.location.href = `/${tenant?.slug}/login`}
                    >
                        Volver al inicio de sesión
                    </Button>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="px-4 py-3 rounded-lg text-sm font-medium border mb-6 bg-danger/10 text-danger border-danger/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="correo@ejemplo.com"
                                icon={<Mail size={20} />}
                                required
                            />
                            <p className="text-xs mt-2 text-text-secondary">
                                Ingresa el correo asociado a tu cuenta
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            icon={<Send size={20} />}
                            className="w-full"
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={`/${tenant?.slug}/login`}
                            className="text-sm font-medium hover:underline transition-colors inline-flex items-center gap-2 text-primary"
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
