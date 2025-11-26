'use client';
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, UserCheck, Clock, AlertTriangle, Smartphone, Zap, FileText, MessageCircle, Users, QrCode, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroHeader from '@/components/ui/HeroHeader';
import DashboardSectionTitle from '@/components/ui/DashboardSectionTitle';
import AIChatPanel from '@/components/features/AIChatPanel';
import api from '@/lib/axios';

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

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [stats, setStats] = useState({
    attendance_percentage: 0,
    late_count: 0,
    absent_count: 0,
    notifications_sent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        
        <HeroHeader 
          title="Dashboard Ejecutivo" 
          subtitle="Resumen general de la institución y métricas clave en tiempo real" 
          icon={LayoutDashboard} 
          gradient="bg-gradient-to-r from-blue-800 to-slate-900 dark:from-blue-900 dark:to-slate-950" 
          decorativeIcon={BarChart3} 
        />
        
        {/* 1. KPIs Section */}
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

        {/* 2. Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Quick Actions Box */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 h-full">
              <DashboardSectionTitle title="Acciones Rápidas" icon={Zap} />
              <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)] content-start">
                 <button className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-md transition-all group h-32">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform"><FileText size={24}/></div>
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300 text-center">Reporte Diario</span>
                 </button>
                 <button onClick={() => setChatOpen(true)} className="p-5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex flex-col items-center justify-center gap-3 hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-md transition-all group h-32">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full text-green-600 dark:text-green-400 shadow-sm group-hover:scale-110 transition-transform"><MessageCircle size={24}/></div>
                    <span className="text-sm font-bold text-green-800 dark:text-green-300 text-center">Alerta WhatsApp</span>
                 </button>
                 <button className="p-5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center gap-3 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:shadow-md transition-all group h-32">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full text-purple-600 dark:text-purple-400 shadow-sm group-hover:scale-110 transition-transform"><Users size={24}/></div>
                    <span className="text-sm font-bold text-purple-800 dark:text-purple-300 text-center">Nuevo Docente</span>
                 </button>
                 <button className="p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-700 hover:shadow-md transition-all group h-32">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300 shadow-sm group-hover:scale-110 transition-transform"><QrCode size={24}/></div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center">Escanear QR</span>
                 </button>
              </div>
           </div>

           {/* System Status Box */}
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