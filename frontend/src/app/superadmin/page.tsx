'use client';
import { useEffect, useState } from 'react';
import { superadminService, TenantStats, Tenant } from '@/lib/api/superadmin';
import { Button } from '@/app/components/ui/base';
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  Plus,
  ExternalLink,
  Settings,
  FileUp,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);


  const handleToggleActive = async (tenant: Tenant) => {
    setTogglingId(tenant.id);
    try {
      const result = await superadminService.toggleTenantActive(tenant.id);
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id ? { ...t, is_active: result.is_active } : t
        )
      );
    } catch (error) {
      console.error('Error toggling tenant:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code?.toLowerCase().includes(search.toLowerCase()) ||
      t.district?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Administración global del sistema
          </p>
        </div>
        <Link href="/superadmin/tenants/nuevo">
          <Button variant="primary" icon={<Plus size={20} />}>
            Nuevo Tenant
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tenants"
          value={stats?.tenants.total ?? 0}
          subtitle={`${stats?.tenants.active ?? 0} activos`}
          icon={<Building2 size={24} />}
          color="primary"
        />
        <StatCard
          title="Usuarios"
          value={stats?.users ?? 0}
          subtitle="Total del sistema"
          icon={<Users size={24} />}
          color="info"
        />
        <StatCard
          title="Estudiantes"
          value={stats?.students ?? 0}
          subtitle="Registrados"
          icon={<GraduationCap size={24} />}
          color="success"
        />
        <StatCard
          title="Docentes"
          value={stats?.teachers ?? 0}
          subtitle="Registrados"
          icon={<UserCheck size={24} />}
          color="warning"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Instituciones
            </h2>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-text-primary text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredTenants.length === 0 ? (
            <div className="p-8 text-center text-text-tertiary">
              No se encontraron instituciones
            </div>
          ) : (
            filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-4 hover:bg-background/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Tenant Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {tenant.logo_url ? (
                        <img
                          src={tenant.logo_url}
                          alt={tenant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 size={24} className="text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary truncate">
                          {tenant.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tenant.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-text-tertiary/10 text-text-tertiary'
                          }`}
                        >
                          {tenant.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary truncate">
                        {tenant.district}, {tenant.province}
                        {tenant.code && ` • Cod: ${tenant.code}`}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-text-primary">
                        {tenant.counts.users}
                      </p>
                      <p className="text-text-tertiary text-xs">Usuarios</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-text-primary">
                        {tenant.counts.students}
                      </p>
                      <p className="text-text-tertiary text-xs">Alumnos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-text-primary">
                        {tenant.counts.teachers}
                      </p>
                      <p className="text-text-tertiary text-xs">Docentes</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(tenant)}
                      disabled={togglingId === tenant.id}
                      className={`p-2 rounded-lg transition-colors ${
                        tenant.is_active
                          ? 'text-success hover:bg-success/10'
                          : 'text-text-tertiary hover:bg-background'
                      }`}
                      title={tenant.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {togglingId === tenant.id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : tenant.is_active ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>

                    <Link
                      href={`/superadmin/tenants/${tenant.id}?tab=importar`}
                      className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary transition-colors"
                      title="Importar CSV"
                    >
                      <FileUp size={20} />
                    </Link>

                    <Link
                      href={`/superadmin/tenants/${tenant.id}`}
                      className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary transition-colors"
                      title="Configurar"
                    >
                      <Settings size={20} />
                    </Link>

                    <a
                      href={`/${tenant.slug}/dashboard`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-text-secondary hover:bg-background hover:text-primary transition-colors"
                      title="Entrar al tenant"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'primary' | 'info' | 'success' | 'warning';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
