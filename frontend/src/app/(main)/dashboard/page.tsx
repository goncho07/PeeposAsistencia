'use client';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, UserCheck, Clock, AlertTriangle, Smartphone, MessageCircle, Shield, PieChartIcon, PieChart } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import HeroHeader from '@/components/ui/HeroHeader';
import DashboardSectionTitle from '@/components/ui/DashboardSectionTitle';
import AIChatPanel from '@/components/features/AIChatPanel';

ChartJS.register(ArcElement, Tooltip, Legend);

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
};

const pieColors = {
   Presente: '#22c55e',
   Tardanza: '#f97316',
   Ausente: '#ef4444',
   Justificado: '#3b82f6'
};

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [stats, setStats] = useState({
    attendance_percentage: 0,
    late_count: 0,
    absent_count: 0,
    notifications_sent: 0
  });
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            setLoading(true);
            const response = await api.get('/attendance/daily-stats');
            const data = response.data;

            const totalPresent = data.students.present + data.teachers.present;
            const totalLate = data.students.late + data.teachers.late;
            const totalAbsent = data.students.absent + data.teachers.absent;
            const totalJustified = data.students.justified;
            
            const totalRegistered = data.students.total_registered + data.teachers.total_registered;
            const attendance_percentage = totalRegistered > 0
               ? Math.round((totalPresent / totalRegistered) * 100)
               : 0;

            setStats({
               attendance_percentage,
               late_count: totalLate,
               absent_count: totalAbsent,
               notifications_sent: data.notifications_sent
            });

            setPieData([
               { name: 'Presente', value: totalPresent, color: pieColors.Presente },
               { name: 'Tardanza', value: totalLate, color: pieColors.Tardanza },
               { name: 'Ausente', value: totalAbsent, color: pieColors.Ausente },
               { name: 'Justificado', value: totalJustified, color: pieColors.Justificado }
            ]);
         } catch (error) {
            console.error('Error fetching daily stats:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchStats();
   }, []);


  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-7xl px-8 py-6 flex flex-col">
        
        <HeroHeader 
          title="Dashboard Ejecutivo" 
          subtitle="Resumen general de la institución y métricas clave en tiempo real" 
          icon={LayoutDashboard} 
          gradient="bg-gradient-to-r from-blue-800 to-slate-900 dark:from-blue-900 dark:to-slate-950" 
          decorativeIcon={BarChart3} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-linear-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden h-36 flex flex-col justify-between">
             <div className="relative z-10">
                <div className="p-2 bg-white/20 rounded-lg text-white w-fit mb-3"><UserCheck size={24} /></div>
                <h3 className="text-4xl font-bold">{loading ? '-' : `${stats.attendance_percentage}%`}</h3>
                <p className="text-sm text-emerald-50 font-medium">Asistencia Hoy</p>
             </div>
             <UserCheck className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12" size={100} />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-linear-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden h-36 flex flex-col justify-between">
             <div className="relative z-10">
                <div className="p-2 bg-white/20 rounded-lg text-white w-fit mb-3"><Clock size={24} /></div>
                <h3 className="text-4xl font-bold">{loading ? '-' : stats.late_count}</h3>
                <p className="text-sm text-orange-50 font-medium">Tardanzas Totales</p>
             </div>
             <Clock className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12" size={100} />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-linear-to-br from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden h-36 flex flex-col justify-between">
             <div className="relative z-10">
                <div className="p-2 bg-white/20 rounded-lg text-white w-fit mb-3"><AlertTriangle size={24} /></div>
                <h3 className="text-4xl font-bold">{loading ? '-' : stats.absent_count}</h3>
                <p className="text-sm text-red-50 font-medium">Ausentes (Sin Justificar)</p>
             </div>
             <AlertTriangle className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12" size={100} />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-linear-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 shadow-md text-white relative overflow-hidden h-36 flex flex-col justify-between">
             <div className="relative z-10">
                <div className="p-2 bg-white/20 rounded-lg text-white w-fit mb-3"><Smartphone size={24} /></div>
                <h3 className="text-4xl font-bold">{loading ? '-' : stats.notifications_sent}</h3>
                <p className="text-sm text-blue-100 font-medium">Notificaciones Enviadas</p>
             </div>
             <MessageCircle className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12" size={100} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 h-full min-h-[400px]">
               <DashboardSectionTitle title="Asistencia Global (Hoy)" icon={PieChartIcon} />
                 <div className="relative w-full h-80 flex items-center justify-center">
                    {pieData.length > 0 ? (
                       <Doughnut
                          data={{
                             labels: pieData.map((d) => d.name),
                             datasets: [
                                {
                                   data: pieData.map((d) => d.value),
                                   backgroundColor: pieData.map((d) => d.color),
                                   borderWidth: 2,
                                   borderColor: '#fff',
                                   hoverOffset: 12,
                                },
                             ],
                          }}
                          options={{
                             responsive: true,
                             maintainAspectRatio: false,
                             cutout: '70%',
                             layout: { padding: 20 },
                             plugins: {
                                legend: {
                                   position: 'bottom' as const,
                                   labels: {
                                      color: '#6b7280',
                                      usePointStyle: true,
                                      pointStyle: 'circle',
                                      padding: 20,
                                      font: {
                                         size: 13,
                                          weight: 'bold',
                                      },
                                   },
                                },
                                tooltip: {
                                   backgroundColor: 'rgba(17,24,39,0.9)',
                                   cornerRadius: 10,
                                   padding: 12,
                                   titleFont: { size: 14 },
                                   bodyFont: { size: 13 },
                                },
                             },
                             animation: {
                                animateScale: true,
                                animateRotate: true,
                                duration: 1200,
                                easing: 'easeOutQuart',
                             },
                          }}
                       />
                    ) : (
                       <div className="text-gray-400 dark:text-gray-500 text-sm italic">
                          Cargando datos...
                       </div>
                    )}

                    {pieData.length > 0 && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-11 text-center pointer-events-none">
                          <span className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
                             {loading ? '-' : `${stats.attendance_percentage}%`}
                          </span>
                          <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold mt-1">
                             Asistencia
                          </span>
                       </div>
                    )}
                 </div>
            </div>

           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 h-full">
              <DashboardSectionTitle title="Estado del Sistema" icon={Shield} />
              <div className="flex flex-col justify-between h-[calc(100%-3rem)] gap-4">
                 <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"/>
                       <span className="text-base text-gray-700 dark:text-gray-200 font-medium">Lectores QR Biométricos</span>
                    </div>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">En Línea (3/3)</span>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"/>
                       <span className="text-base text-gray-700 dark:text-gray-200 font-medium">API WhatsApp Business</span>
                    </div>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">Conectado</span>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"/>
                       <span className="text-base text-gray-700 dark:text-gray-200 font-medium">Sincronización Cloud</span>
                    </div>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">Hace 1 min</span>
                 </div>
              </div>
           </div>
        </div>

      </motion.div>

      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}