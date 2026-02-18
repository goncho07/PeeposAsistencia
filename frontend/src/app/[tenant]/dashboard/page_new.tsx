'use client';
import { useEffect, useState } from 'react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { KPICard } from '@/app/components/KPICard';
import { AttendanceDonutChart } from '@/app/components/AttendanceDonutChart';
import { LayoutDashboard, UserCheck, Clock, UserX, Bell } from 'lucide-react';
import { attendanceService, DailyStats } from '@/lib/api/attendance';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getDailyStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching daily stats:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getKPIData = () => {
    if (!stats) return [];

    const totalPresent = stats.students.present + stats.teachers.present;
    const totalLate = stats.students.late + stats.teachers.late;
    const totalAbsent = stats.students.absent + stats.teachers.absent + stats.students.justified;

    return [
      {
        title: 'Total Presente',
        value: totalPresent,
        subtext: `${stats.students.present} estudiantes, ${stats.teachers.present} docentes`,
        mainIcon: UserCheck,
        gradient: 'bg-gradient-to-br from-green-500 to-green-700'
      },
      {
        title: 'Total Tardanzas',
        value: totalLate,
        subtext: `${stats.students.late} estudiantes, ${stats.teachers.late} docentes`,
        mainIcon: Clock,
        gradient: 'bg-gradient-to-br from-amber-500 to-amber-700'
      },
      {
        title: 'Total Ausentes',
        value: totalAbsent,
        subtext: `${stats.students.absent + stats.students.justified} estudiantes, ${stats.teachers.absent} docentes`,
        mainIcon: UserX,
        gradient: 'bg-gradient-to-br from-red-500 to-red-700'
      },
      {
        title: 'Notificaciones',
        value: stats.notifications_sent,
        subtext: 'Enviadas hoy',
        mainIcon: Bell,
        gradient: 'bg-gradient-to-br from-blue-500 to-blue-700'
      }
    ];
  };

  return (
    <DashboardLayout>
      <HeroHeader
        title="Dashboard Ejecutivo"
        subtitle="Resumen general de la institución y métricas clave en tiempo real."
        icon={LayoutDashboard}
        gradient="bg-gradient-to-r from-blue-800 to-slate-900 dark:from-blue-900 dark:to-slate-950"
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Cargando estadísticas...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card mb-8">
          <div className="text-center py-8">
            <p style={{ color: 'var(--color-danger)' }} className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
          >
            {getKPIData().map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                subtext={kpi.subtext}
                mainIcon={kpi.mainIcon}
                gradient={kpi.gradient}
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceDonutChart
                data={{
                  students: stats.students,
                  teachers: stats.teachers
                }}
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Notificaciones
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-success)' }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Notificaciones enviadas
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {stats.notifications_sent} mensajes enviados hoy
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Fecha de reporte
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(stats.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
