"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, ArrowRightCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/providers/theme-provider';

const LoginView: React.FC = () => {
    const router = useRouter();

    const handleLogin = () => {
        // In a real app, you'd perform authentication here.
        // For this demo, we'll just redirect.
        router.push('/users');
    };

    const loginBg = PlaceHolderImages.find((img) => img.id === 'login-bg')?.imageUrl || 'https://picsum.photos/seed/loginbg/1920/1080';
    const schoolLogo = PlaceHolderImages.find((img) => img.id === 'school-logo')?.imageUrl || 'https://picsum.photos/seed/schoollogo/400/400';

    return (
        <ThemeProvider>
            <div className="flex h-screen w-full bg-background font-body">
                <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
                    <Image
                        src={loginBg}
                        alt="School Background"
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint="school building"
                    />
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
                </div>
                <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-card">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <Image
                                src={schoolLogo}
                                alt="School Logo"
                                width={192}
                                height={192}
                                className="mx-auto h-48 w-auto object-contain transition-transform hover:scale-105 duration-500 mb-4"
                                data-ai-hint="school logo"
                            />
                            <h2 className="text-3xl font-bold text-foreground">Iniciar Sesión</h2>
                            <p className="text-sm text-muted-foreground mt-2">Ingresa a tu panel de control institucional</p>
                        </div>

                        <div className="space-y-4">
                            <Button variant="outline" className="w-full" onClick={handleLogin}>
                                <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 11.8 244 11.8c70.3 0 136.5 28.7 183.4 75.9l-62.8 62.8C337 113.4 293.6 95.8 244 95.8c-106.1 0-192.2 86.1-192.2 192.2s86.1 192.2 192.2 192.2c106.1 0 192.2-86.1 192.2-192.2 0-25.2-4.9-50.5-13.9-74.9h-178.3v-91h284.4c5.2 28.3 8.3 58 8.3 89.1z"/>
                                </svg>
                                Continuar con Google
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">O ingresa con correo</span>
                                <div className="flex-grow border-t"></div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input id="email" type="email" placeholder="director@colegio.edu.pe" className="pl-10" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="password">Contraseña</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="remember-me" />
                                        <Label htmlFor="remember-me" className="text-muted-foreground font-normal">Recordarme</Label>
                                    </div>
                                    <a href="#" className="text-primary hover:underline font-medium">¿Olvidaste tu contraseña?</a>
                                </div>
                                <Button onClick={handleLogin} className="w-full font-bold shadow-lg shadow-primary/20 dark:shadow-none">
                                    Ingresar <ArrowRightCircle size={20} />
                                </Button>
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            ¿No tienes una cuenta? <a href="#" className="text-primary font-bold hover:underline">Regístrate</a>
                        </p>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default LoginView;
