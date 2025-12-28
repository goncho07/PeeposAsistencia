'use client';
import { useEffect, useState } from 'react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { KPICard } from '@/app/components/ui/KPICard';
import { AttendanceDonutChart } from '@/app/components/AttendanceDonutChart';
import { ConnectedDevices } from '@/app/components/ui/ConnectedDevices';
import { LayoutDashboard, UserCheck, Clock, UserX, Bell } from 'lucide-react';
import { attendanceService, DailyStats } from '@/lib/api/attendance';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0
    }
  }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      delay: 0.15
    }
  }
};

const notificationVariants = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      delay: 0.2
    }
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await attendanceService.getDailyStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching daily stats:', err);
        setError('No se pudieron cargar las estadísticas');
      }
    };

    fetchStats();
  }, []);

  const getKPIData = () => {
    const kpiStructure = [
      {
        title: 'Total Presente',
        mainIcon: UserCheck,
        gradient: 'bg-gradient-to-br from-green-500 to-green-700'
      },
      {
        title: 'Total Tardanzas',
        mainIcon: Clock,
        gradient: 'bg-gradient-to-br from-amber-500 to-amber-700'
      },
      {
        title: 'Total Ausentes',
        mainIcon: UserX,
        gradient: 'bg-gradient-to-br from-red-500 to-red-700'
      },
      {
        title: 'Notificaciones',
        mainIcon: Bell,
        gradient: 'bg-gradient-to-br from-blue-500 to-blue-700'
      }
    ];

    if (!stats) {
      return kpiStructure.map(kpi => ({
        ...kpi,
        value: '—',
        subtext: 'Cargando...'
      }));
    }

    const totalPresent = stats.students.present + stats.teachers.present;
    const totalLate = stats.students.late + stats.teachers.late;
    const totalAbsent = stats.students.absent + stats.teachers.absent + stats.students.justified;

    return [
      {
        ...kpiStructure[0],
        value: totalPresent,
        subtext: `${stats.students.present} estudiantes, ${stats.teachers.present} docentes`
      },
      {
        ...kpiStructure[1],
        value: totalLate,
        subtext: `${stats.students.late} estudiantes, ${stats.teachers.late} docentes`
      },
      {
        ...kpiStructure[2],
        value: totalAbsent,
        subtext: `${stats.students.absent + stats.students.justified} estudiantes, ${stats.teachers.absent} docentes`
      },
      {
        ...kpiStructure[3],
        value: stats.notifications_sent,
        subtext: 'Enviadas hoy'
      }
    ];
  };

  return (
    <DashboardLayout>
      <HeroHeader
        title="Dashboard"
        subtitle="Resumen general de la institución y métricas clave en tiempo real."
        icon={LayoutDashboard}
      />

      {error && (
        <div className="card mb-4">
          <div className="text-center py-4">
            <p style={{ color: 'var(--color-danger)' }} className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

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
        <motion.div
          className="lg:col-span-2"
          variants={chartVariants}
          initial="hidden"
          animate="show"
        >
          {stats ? (
            <AttendanceDonutChart
              data={{
                students: stats.students,
                teachers: stats.teachers
              }}
            />
          ) : (
            <div className="card h-full">
              <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Asistencia del Día
              </h3>
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <motion.div
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Cargando datos...</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="card"
          variants={notificationVariants}
          initial="hidden"
          animate="show"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ConnectedDevices />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
