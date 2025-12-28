'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/app/contexts/TenantProvider';
import { AuthLayout } from '@/app/components/layouts/AuthLayout';
import { authService } from '@/lib/api/auth';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { tenant } = useTenant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({
        email,
        password,
        remember_me: rememberMe,
        tenant_slug: tenant?.slug,
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const maxAge = rememberMe ? 7776000 : 2592000;
      document.cookie = `token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${maxAge}; SameSite=Lax`;

      router.push(`/${tenant?.slug}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Iniciar Sesión para ingresar al panel">
      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
        </div>

        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="label mb-0">
              Contraseña
            </label>
            <Link
              href={`/${tenant?.slug}/recover-password`}
              className="auth-link"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="input-with-icon relative">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="input-action"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-checkbox">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="checkbox"
          />
          <label htmlFor="remember" className="checkbox-label">
            Mantener sesión iniciada
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-auth"
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              <LogIn size={20} />
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          ¿Problemas para ingresar?{' '}
          <a href="mailto:soporte@peepos.com" className="auth-link">
            Contactar soporte
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}