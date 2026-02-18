'use client';
import { useEffect, useState } from 'react';
import { academicYearService, AcademicYear } from '@/lib/api/academic-years';
import { Button, Input } from '@/app/components/ui/base';
import { CalendarDays, Plus, Play, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PLANIFICADO: { label: 'Planificado', color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  ACTIVO: { label: 'Activo', color: 'bg-success/10 text-success', dot: 'bg-success' },
  FINALIZADO: { label: 'Finalizado', color: 'bg-text-tertiary/10 text-text-tertiary', dot: 'bg-text-tertiary' },
};

const DEFAULT_BIMESTERS = [
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
  { start_date: '', end_date: '' },
];

export function TenantAcademicYearTab() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [newBimesters, setNewBimesters] = useState(DEFAULT_BIMESTERS);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadYears();
  }, []);

  const loadYears = async () => {
    try {
      setLoading(true);
      const data = await academicYearService.getAll();
      setYears(data);
    } catch {
      setError('No se pudieron cargar los años académicos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      await academicYearService.create({ year: newYear, bimesters: newBimesters });
      setShowCreate(false);
      setNewBimesters(DEFAULT_BIMESTERS);
      await loadYears();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear año académico');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: number) => {
    setActionLoading(id);
    try {
      await academicYearService.activate(id);
      await loadYears();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al activar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalize = async (id: number) => {
    if (!confirm('¿Estás seguro de finalizar este año académico? Esta acción no se puede deshacer.')) return;
    setActionLoading(id);
    try {
      await academicYearService.finalize(id);
      await loadYears();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al finalizar');
    } finally {
      setActionLoading(null);
    }
  };

  const updateBimester = (index: number, field: 'start_date' | 'end_date', value: string) => {
    setNewBimesters((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-40 bg-card animate-pulse rounded" />
              <div className="h-3 w-56 bg-card animate-pulse rounded" />
            </div>
          </div>
          <div className="h-9 w-28 bg-card animate-pulse rounded-lg" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="p-5 bg-background">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-card animate-pulse rounded" />
                  <div className="h-5 w-20 bg-card animate-pulse rounded-full" />
                </div>
                <div className="h-9 w-24 bg-card animate-pulse rounded-lg" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="p-3 rounded-xl bg-surface border border-border">
                    <div className="h-3 w-20 bg-card animate-pulse rounded mb-2" />
                    <div className="h-3 w-28 bg-card animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {showCreate && (
        <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
          <h4 className="text-base font-semibold text-text-primary">Crear Año Académico</h4>

          <Input
            label="Año"
            type="number"
            value={newYear.toString()}
            onChange={(v) => setNewYear(Number(v))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newBimesters.map((bim, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-sm font-semibold text-text-primary mb-3">Bimestre {i + 1}</p>
                <div className="space-y-2">
                  <Input
                    label="Inicio"
                    type="date"
                    value={bim.start_date}
                    onChange={(v) => updateBimester(i, 'start_date', v)}
                  />
                  <Input
                    label="Fin"
                    type="date"
                    value={bim.end_date}
                    onChange={(v) => updateBimester(i, 'end_date', v)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setError(null); }} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={saving} className="w-full sm:w-auto">
              Crear
            </Button>
          </div>
        </div>
      )}

      {years.length === 0 && !showCreate ? (
        <div className="text-center py-12 bg-background rounded-xl border border-border">
          <CalendarDays size={48} className="mx-auto text-text-tertiary mb-3" />
          <p className="text-lg text-text-secondary">No hay años académicos configurados</p>
          <p className="text-sm text-text-tertiary mt-1">Crea uno para comenzar a gestionar bimestres</p>
          <Button variant="primary" className="mt-4" icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
            Crear el primero
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {years
            .sort((a, b) => b.year - a.year)
            .map((year) => {
              const status = STATUS_CONFIG[year.status] || STATUS_CONFIG.PLANIFICADO;
              const isLoading = actionLoading === year.id;

              return (
                <div key={year.id} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-4 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-bold text-text-primary">{year.year}</h4>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-base font-medium ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      {year.is_current && (
                        <span className="px-2.5 py-0.5 rounded-full text-base font-medium bg-primary/10 text-primary">
                          Actual
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {year.status === 'PLANIFICADO' && (
                        <Button
                          variant="primary"
                          icon={<Play size={24} />}
                          onClick={() => handleActivate(year.id)}
                          loading={isLoading}
                          className="flex-1 sm:flex-initial text-xl"
                        >
                          Activar
                        </Button>
                      )}
                      {year.status === 'ACTIVO' && (
                        <Button
                          variant="outline"
                          icon={<CheckCircle2 size={24} />}
                          onClick={() => handleFinalize(year.id)}
                          loading={isLoading}
                          className="flex-1 sm:flex-initial text-xl"
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>

                  {year.bimesters && year.bimesters.length > 0 && (
                    <div className="px-5 pb-5 pt-3">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {year.bimesters
                          .sort((a, b) => a.number - b.number)
                          .map((bim) => (
                            <div key={bim.id} className="p-3 rounded-xl bg-background border border-border">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Calendar size={22} className="text-primary" />
                                <p className="text-xl font-semibold text-text-secondary">
                                  Bimestre {bim.number}
                                </p>
                              </div>
                              <p className="text-base text-text-primary font-medium">
                                {formatDate(bim.start_date)} - {formatDate(bim.end_date)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
}