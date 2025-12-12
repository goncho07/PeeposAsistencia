'use client';
import api from '@/lib/axios';
import React, { useState } from 'react';
import { Mail, Lock, ArrowRightCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AlertType = 'error' | 'success' | 'warning';

interface Alert {
    type: AlertType;
    message: string;
}

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<Alert | null>(null);

    const showAlert = (type: AlertType, message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            showAlert('warning', 'Por favor completa todos los campos');
            return;
        }

        setIsLoading(true);
        setAlert(null);

        try {
            const response = await api.post('/login', { email, password });
            const { token, user, expires_at } = response.data;

            await login(token, {
                id: user.id,
                name: user.name,
                email: user.email,
                rol: user.rol,
                avatar_url: user.avatar_url,
            }, expires_at);

        } catch (error: any) {
            console.error('Error en login:', error);

            if (error.response) {
                const status = error.response.status;
                const errorCode = error.response.data?.error_code;

                if (status === 422) {
                    showAlert('error', 'Credenciales incorrectas. Verifica tu correo y contraseña.');
                } else if (status === 403 && errorCode === 'ACCOUNT_INACTIVE') {
                    showAlert('error', 'Tu cuenta está inactiva. Contacta al administrador.');
                } else if (status === 429) {
                    const message = error.response.data?.errors?.email?.[0] ?? 'Demasiados intentos. Intenta nuevamente más tarde.';
                    showAlert('error', message);
                } else {
                    showAlert('error', 'Error al iniciar sesión. Intenta nuevamente.');
                }
            } else {
                showAlert('error', 'Estamos experimentando dificultades para procesar tu solicitud. Por favor, inténtalo de nuevo en unos momentos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}</style>

            <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 font-['Poppins']">
                <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
                    <img
                        src="/images/image_palma.png"
                        alt="School Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
                </div>

                <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
                    <div className="w-full max-w-md space-y-8">

                        <div className="text-center">
                            <img
                                src="/images/banner_palma_black.png"
                                alt="School Logo"
                                className="mx-auto h-48 mb-8 object-contain transition-transform hover:scale-105 duration-500"
                            />
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Ingresa a tu panel de control institucional
                            </p>
                        </div>

                        {alert && (
                            <div
                                className={`flex items-center gap-3 p-4 rounded-xl border ${alert.type === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                                        : alert.type === 'success'
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                                    }`}
                            >
                                {alert.type === 'error' ? (
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                )}
                                <p className="text-sm font-medium">{alert.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="director@colegio.edu.pe"
                                        disabled={isLoading}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">Recordarme</span>
                                </label>

                                <a
                                    href="/recuperar-contrasena"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    <>
                                        Ingresar <ArrowRightCircle size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}