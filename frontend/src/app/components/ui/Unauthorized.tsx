'use client';
import { ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/app/contexts/TenantContext';
import { buildTenantPath } from '@/lib/axios';
import { Button } from './base/Button';

export function Unauthorized() {
  const router = useRouter();
  const { tenant } = useTenant();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-danger/10 flex items-center justify-center">
          <ShieldX size={40} className="text-danger" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Acceso restringido
        </h1>

        <p className="text-text-secondary dark:text-text-secondary-dark mb-8">
          No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.
        </p>

        <Button
          variant="primary"
          onClick={() => router.push(buildTenantPath('/dashboard', tenant?.slug))}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
