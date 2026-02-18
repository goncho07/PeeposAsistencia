'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { superadminService, Tenant } from '@/lib/api/superadmin';
import { Button } from '@/app/components/ui/base';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileUp,
  Settings,
  AlertTriangle,
  School,
  CalendarDays,
  SlidersHorizontal,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { TenantGeneralTab } from '../../components/TenantGeneralTab';
import { TenantImportTab } from '../../components/TenantImportTab';
import { TenantClassroomsTab } from '../../components/TenantClassroomsTab';
import { TenantDangerTab } from '../../components/TenantDangerTab';
import { TenantAcademicYearTab } from '../../components/TenantAcademicYearTab';
import { TenantSettingsTab } from '../../components/TenantSettingsTab';
import { TenantWhatsAppTab } from '../../components/TenantWhatsAppTab';

type TabKey = 'general' | 'importar' | 'aulas' | 'academico' | 'configuracion' | 'whatsapp' | 'peligro';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'general', label: 'General', icon: <Settings size={18} /> },
  { key: 'importar', label: 'Importar CSV', icon: <FileUp size={18} /> },
  { key: 'aulas', label: 'Aulas', icon: <School size={18} /> },
  { key: 'academico', label: 'Año Escolar', icon: <CalendarDays size={18} /> },
  { key: 'configuracion', label: 'Configuración', icon: <SlidersHorizontal size={18} /> },
  { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
  { key: 'peligro', label: 'Zona Peligro', icon: <AlertTriangle size={18} /> },
];

export default function TenantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantId = Number(params.id);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get('tab') as TabKey) || 'general'
  );

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    try {
      const data = await superadminService.getTenant(tenantId);
      setTenant(data);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.push(`/admin/tenants/${tenantId}?tab=${tab}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <Building2 size={72} className="mx-auto text-text-tertiary mb-4" />
        <h2 className="text-3xl font-semibold text-text-primary">
          Tenant no encontrado
        </h2>
        <Link href="/admin/tenants">
          <Button variant="ghost" className="mt-4 text-xl">
            Volver a la lista
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/tenants"
            className="p-2 rounded-lg hover:bg-background text-text-secondary mt-1"
          >
            <ArrowLeft size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="w-14 h-14 rounded-lg"
                />
              ) : (
                <Building2 size={28} className="text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  {tenant.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${
                    tenant.is_active
                      ? 'bg-success/10 text-success'
                      : 'bg-text-tertiary/10 text-text-tertiary'
                  }`}
                >
                  {tenant.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-base text-text-secondary">
                {tenant.district}, {tenant.province}
                {tenant.modular_code && ` · Cod: ${tenant.modular_code}`}
              </p>
            </div>
          </div>
        </div>

        <a
          href={`https://${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'intelicole.pe'}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink size={22} />
          Ver Panel del Tenant
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios', value: tenant.counts.users },
          { label: 'Estudiantes', value: tenant.counts.students },
          { label: 'Docentes', value: tenant.counts.teachers },
          { label: 'Aulas', value: tenant.counts.classrooms },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-lg p-4 text-center">
            <p className="text-4xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-lg text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="border-b border-border px-2 pt-2">
          <nav className="flex gap-0.5 sm:gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                title={tab.label}
                className={`cursor-pointer flex flex-1 sm:flex-initial items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 lg:px-5 py-3 text-base font-medium whitespace-nowrap rounded-t-lg transition-all ${
                  activeTab === tab.key
                    ? 'bg-background text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background/60 active:bg-background/80'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'general' && (
            <TenantGeneralTab tenant={tenant} onUpdate={setTenant} />
          )}
          {activeTab === 'importar' && <TenantImportTab />}
          {activeTab === 'aulas' && <TenantClassroomsTab />}
          {activeTab === 'academico' && <TenantAcademicYearTab />}
          {activeTab === 'configuracion' && <TenantSettingsTab />}
          {activeTab === 'whatsapp' && <TenantWhatsAppTab tenantId={tenantId} />}
          {activeTab === 'peligro' && (
            <TenantDangerTab tenant={tenant} onDelete={() => router.push('/admin/tenants')} />
          )}
        </div>
      </div>
    </div>
  );
}
