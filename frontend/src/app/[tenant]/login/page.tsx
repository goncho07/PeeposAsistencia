'use client';
import { useState } from 'react';
import { useTenant } from '@/app/contexts/TenantContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { AuthLayout } from '@/app/components/layouts/AuthLayout';
import { Input, Button } from '@/app/components/ui/base';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { tenant } = useTenant();
  const { login } = useAuth();

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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary">
              Contraseña
              <span className="text-danger ml-1">*</span>
            </label>
            <Link
              href={`/${tenant?.slug}/recover-password`}
              className="text-sm font-medium hover:underline transition-colors text-primary"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            icon={<Lock size={20} />}
            actionIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onActionClick={() => setShowPassword(!showPassword)}
            required
          />
        </div>

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
