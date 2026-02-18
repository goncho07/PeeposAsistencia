'use client';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { TabHeader } from '../shared/TabHeader';
import { Input } from '@/app/components/ui/base';
import { academicYearService, AcademicYear } from '@/lib/api/academic-years';

export function BimestresTab() {
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAcademicYear();
  }, []);

  const loadAcademicYear = async () => {
    try {
      setLoading(true);
      const data = await academicYearService.getCurrent();
      setAcademicYear(data);
    } catch {
      setError('No se pudo cargar el año académico actual');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl bg-background dark:bg-background-dark animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !academicYear) {
    return (
      <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
        <p className="text-danger text-center">{error || 'No hay año académico activo'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
      <TabHeader
        icon={Calendar}
        title={`Períodos Bimestrales — ${academicYear.year}`}
        description="Fechas de inicio y fin de cada bimestre del año escolar actual (solo lectura)"
        iconBgColor="bg-gradient-to-br from-orange-500 to-orange-700"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {academicYear.bimesters
          .sort((a, b) => a.number - b.number)
          .map((bimester) => (
          <div
            key={bimester.number}
            className="p-5 rounded-xl bg-background dark:bg-background-dark"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary dark:text-text-primary-dark">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-500 to-orange-700">
                {bimester.number}
              </span>
              <span>Bimestre {bimester.number}</span>
            </h3>
            <div className="space-y-3">
              <Input
                label="Fecha de inicio"
                type="date"
                value={bimester.start_date}
                onChange={() => {}}
                disabled
              />
              <Input
                label="Fecha de fin"
                type="date"
                value={bimester.end_date}
                onChange={() => {}}
                disabled
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
