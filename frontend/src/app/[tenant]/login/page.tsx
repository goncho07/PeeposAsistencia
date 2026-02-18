'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenant } from '@/app/contexts/TenantContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { AuthLayout } from '@/app/components/layouts/AuthLayout';
import { Input, Button } from '@/app/components/ui/base';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { tenant } = useTenant();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email,
        password,
        remember_me: rememberMe,
        tenant_slug: tenant?.slug,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
    const params = new URLSearchParams({
      context: 'tenant',
      tenant_slug: tenant?.slug || '',
    });
    window.location.href = `${apiBase}/auth/google/redirect?${params.toString()}`;
  };

  return (
    <AuthLayout subtitle="Iniciar Sesión para ingresar al panel">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium border mb-6 bg-danger/10 text-danger border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="correo@ejemplo.com"
          icon={<Mail size={20} />}
          required
        />

        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={<Lock size={20} />}
          actionIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onActionClick={() => setShowPassword(!showPassword)}
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded focus:ring-2 cursor-pointer accent-primary border-border"
            />
            <label
              htmlFor="remember"
              className="ml-2 text-sm cursor-pointer select-none text-text-primary"
            >
              Mantener sesión iniciada
            </label>
          </div>

          <Link
            href="/recover-password"
            className="text-sm font-medium hover:underline transition-colors text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={<LogIn size={20} />}
          className="w-full"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-surface text-text-tertiary">o continuar con</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-surface hover:bg-hover transition-colors text-text-primary font-medium"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Iniciar sesión con Google
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          ¿Problemas para ingresar?{' '}
          <a
            href="mailto:soporte@peepos.com"
            className="text-sm font-medium hover:underline transition-colors text-primary"
          >
            Contactar soporte
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
