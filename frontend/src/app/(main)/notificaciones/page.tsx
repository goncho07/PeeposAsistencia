'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, MessageSquare, Sparkles, Send, Smile, Paperclip, MessageCircle } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import NotificationCard, { Notification } from '@/components/ui/NotificationCard';

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

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'alert' | 'info' | 'success'>('all');
  
  const allNotifications: Notification[] = [
    { id: 1, title: "3 Alumnos sin salida registrada", time: "Hace 10 min", type: "alert" },
    { id: 2, title: "Reporte mensual generado", time: "Hace 1 hora", type: "success" },
    { id: 3, title: "Tardanza recurrente: 5to B", time: "Hace 2 horas", type: "warning" },
    { id: 4, title: "Reunión de padres programada", time: "Ayer", type: "info" },
    { id: 5, title: "Sistema actualizado correctamente", time: "Ayer", type: "success" },
    { id: 6, title: "Intento de acceso no autorizado", time: "Hace 2 días", type: "alert" },
  ];

  const filtered = filter === 'all' ? allNotifications : allNotifications.filter(n => n.type === filter || (filter === 'info' && (n.type === 'info' || n.type === 'warning'))); 

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col space-y-8">
        
        {/* Notifications Section */}
        <section>
            <HeroHeader 
            title="Centro de Notificaciones" 
            subtitle="Historial de alertas y avisos del sistema" 
            icon={Bell} 
            gradient="bg-gradient-to-r from-orange-500 to-red-600" 
            decorativeIcon={AlertTriangle} 
            />
            
            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'alert', 'success', 'info'].map(f => (
                <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                    filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                }`}
                >
                {f === 'all' ? 'Todas' : f}
                </button>
            ))}
            </div>

            <div className="space-y-3">
            {filtered.map(notification => (
                <motion.div key={notification.id} variants={itemVariants}>
                    <NotificationCard notification={notification} />
                </motion.div>
            ))}
            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Bell size={48} className="mx-auto mb-3 opacity-20" />
                <p>No hay notificaciones en esta categoría</p>
                </div>
            )}
            </div>
        </section>

        {/* Messaging Section (Integrated here for simplicity as per layout request) */}
        <section>
            <HeroHeader title="Centro de Mensajería" subtitle="Comunicaciones automáticas y manuales vía WhatsApp" icon={MessageSquare} gradient="bg-gradient-to-r from-emerald-500 to-teal-600" decorativeIcon={MessageCircle} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col"><h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2"><Sparkles size={18} className="text-emerald-500" /> Plantillas Rápidas</h3><div className="space-y-3 flex-1 overflow-y-auto pr-2">{['Recordatorio de Reunión', 'Aviso de Tardanza', 'Evento Escolar', 'Suspensión de Clases', 'Citación Urgente'].map((t, i) => (<motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer transition-all flex justify-between items-center group"><span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{t}</span><Send size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" /></motion.div>))}</div></div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-full"><h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2"><MessageCircle size={18} className="text-emerald-500" /> Redactar Mensaje</h3><div className="relative flex-1 mb-4"><textarea className="w-full h-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-sm border-none outline-none focus:ring-2 focus:ring-emerald-100 dark:text-white resize-none placeholder-gray-400" placeholder="Escriba el mensaje aquí..."></textarea><div className="absolute bottom-3 right-3 flex gap-2"><button className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow"><Smile size={16} /></button><button className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow"><Paperclip size={16} /></button></div></div><button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none">Enviar a Selección <Send size={16} /></button></div>
            </div>
        </section>

      </motion.div>
    </div>
  );
}