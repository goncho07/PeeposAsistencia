'use client';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { Home } from 'lucide-react';
import { useDailyStats } from '@/app/features/dashboard/hooks/useDailyStats';
import { DailyStatsCards, AttendanceDonutChart, DeviceDetection } from '@/app/features/dashboard/components';

export default function DashboardPage() {
  const { stats, loading, error } = useDailyStats();

  return (
    <AppLayout>
      <HeroHeader
        title="Dashboard"
        subtitle="Resumen general de la institución y métricas clave en tiempo real."
        icon={Home}
      />

      {error && (
        <div className="rounded-xl p-6 mb-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-danger dark:text-danger-light">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <DailyStatsCards stats={stats} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceDonutChart stats={stats} loading={loading} />
        </div>

        <DeviceDetection />
      </div>
    </AppLayout>
  );
}
