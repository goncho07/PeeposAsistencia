'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { superadminService, Tenant } from '@/lib/api/superadmin';
import { Button, Input } from '@/app/components/ui/base';
import {
  Building2,
  Plus,
  Search,
  Users,
  GraduationCap,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_BIMESTERS = [
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
];

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enteringId, setEnteringId] = useState<number | null>(null);

  const [showGlobalYear, setShowGlobalYear] = useState(false);
  const [globalYear, setGlobalYear] = useState(new Date().getFullYear() + 1);
  const [globalBimesters, setGlobalBimesters] = useState(DEFAULT_BIMESTERS);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const clearTenantContext = async () => {
      try {
        await superadminService.exitTenant();
      } catch (error) {
        //
      }
    };

    clearTenantContext();
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await superadminService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterTenant = async (tenant: Tenant) => {
    if (enteringId) return;
    setEnteringId(tenant.id);
    try {
      await superadminService.enterTenant(tenant.id);
      router.push(`/admin/tenants/${tenant.id}`);
    } catch (error) {
      console.error('Error entering tenant:', error);
      setEnteringId(null);
    }
  };

  const handleBulkCreateYear = async () => {
    const hasEmptyDates = globalBimesters.some((b) => !b.start_date || !b.end_date);
    if (hasEmptyDates) {
      setBulkResult({ type: 'error', text: 'Completa todas las fechas de los bimestres' });
      return;
    }

    setBulkSaving(true);
    setBulkResult(null);
    try {
      const { message } = await superadminService.bulkCreateAcademicYear({
        year: globalYear,
        bimesters: globalBimesters,
      });
      setBulkResult({ type: 'success', text: message });
      setShowGlobalYear(false);
      setGlobalBimesters(DEFAULT_BIMESTERS.map(() => ({ start_date: '', end_date: '' })));
    } catch (err: any) {
      setBulkResult({
        type: 'error',
        text: err.response?.data?.message || 'Error al crear año académico global',
      });
    } finally {
      setBulkSaving(false);
    }
  };

  const updateGlobalBimester = (index: number, field: 'start_date' | 'end_date', value: string) => {
    setGlobalBimesters((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const filteredTenants = tenants.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.modular_code?.toLowerCase().includes(q) ||
      t.district?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-card animate-pulse rounded" />
          <div className="h-10 w-36 bg-card animate-pulse rounded-lg" />
        </div>
        <div className="h-12 bg-card animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Instituciones</h1>
          <p className="text-lg text-text-secondary">
            {tenants.length} institución{tenants.length !== 1 ? 'es' : ''} registrada{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/tenants/nuevo">
          <Button variant="primary" icon={<Plus size={24} />} className="text-xl">
            Nueva Institución
          </Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => { setShowGlobalYear((v) => !v); setBulkResult(null); }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-background/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={24} className="text-primary shrink-0" />
            <div>
              <span className="text-lg font-bold text-text-primary">Año Escolar Global</span>
              <span className="hidden sm:inline text-base font-medium text-text-secondary ml-2">Aplicar a todas las instituciones</span>
            </div>
          </div>
          {showGlobalYear ? <ChevronDown size={24} className="text-text-tertiary" /> : <ChevronRight size={24} className="text-text-tertiary" />}
        </button>

        {showGlobalYear && (
          <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
            <Input
              label="Año"
              type="number"
              value={globalYear.toString()}
              onChange={(v) => setGlobalYear(Number(v))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {globalBimesters.map((bim, i) => (
                <div key={i} className="p-4 rounded-lg bg-background border border-border">
                  <p className="text-xl font-bold text-text-primary mb-3">Bimestre {i + 1}</p>
                  <div className="space-y-2">
                    <Input
                      label="Inicio"
                      type="date"
                      value={bim.start_date}
                      onChange={(v) => updateGlobalBimester(i, 'start_date', v)}
                    />
                    <Input
                      label="Fin"
                      type="date"
                      value={bim.end_date}
                      onChange={(v) => updateGlobalBimester(i, 'end_date', v)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-base text-text-secondary">
                Se creará el año {globalYear} en {tenants.filter((t) => t.is_active).length} institución(es) activa(s)
              </p>
              <Button variant="primary" onClick={handleBulkCreateYear} loading={bulkSaving} className="text-xl w-full sm:w-auto">
                Crear en Todas
              </Button>
            </div>
          </div>
        )}
      </div>

      {bulkResult && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            bulkResult.type === 'success'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {bulkResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {bulkResult.text}
        </div>
      )}

      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, código, distrito..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary text-lg w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-3">
        {filteredTenants.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Building2 size={40} className="mx-auto text-text-tertiary mb-3" />
            <p className="text-text-secondary">No se encontraron instituciones</p>
          </div>
        ) : (
          filteredTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => handleEnterTenant(tenant)}
              disabled={enteringId === tenant.id}
              className="w-full text-left bg-surface border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  {tenant.logo_url ? (
                    <img
                      src={tenant.logo_url}
                      alt={tenant.name}
                      className="w-14 h-14 rounded-lg"
                    />
                  ) : (
                    <Building2 size={24} className="text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xl text-text-primary truncate group-hover:text-primary transition-colors">
                      {tenant.name}
                    </p>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${
                        tenant.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-text-tertiary/10 text-text-tertiary'
                      }`}
                    >
                      {tenant.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-base text-text-secondary truncate">
                    {tenant.modular_code || 'Sin código'}
                    {tenant.district && ` · ${tenant.district}, ${tenant.province}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-text-secondary">
                    <Users size={18} className="sm:w-7 sm:h-7" />
                    <span className="text-sm sm:text-xl font-medium">{tenant.counts.students}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-text-secondary">
                    <GraduationCap size={18} className="sm:w-7 sm:h-7" />
                    <span className="text-sm sm:text-xl font-medium">{tenant.counts.teachers}</span>
                  </div>
                </div>

                {enteringId === tenant.id && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
