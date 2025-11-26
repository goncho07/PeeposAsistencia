'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import NotificationCard, { Notification } from '@/components/ui/NotificationCard';
import api from '@/lib/axios';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'alert' | 'info' | 'success'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filtered = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter || (filter === 'info' && n.type === 'warning'));

  return (
    <div className="w-full flex justify-center min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Notificaciones" subtitle="Alertas del sistema" icon={Bell} gradient="bg-gradient-to-r from-orange-500 to-red-600" decorativeIcon={AlertTriangle} />
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
           {['all', 'alert', 'success', 'info'].map(f => (
             <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border dark:border-slate-700'}`}>
               {f === 'all' ? 'Todas' : f}
             </button>
           ))}
        </div>

        <div className="space-y-3">
           {loading ? (
             <div className="text-center py-12 text-gray-400">Cargando notificaciones...</div>
           ) : filtered.length > 0 ? (
             filtered.map((notification) => (
               <motion.div key={notification.id} variants={itemVariants}>
                 <NotificationCard notification={notification} />
               </motion.div>
             ))
           ) : (
             <div className="text-center py-12 text-gray-400 dark:text-gray-500">
               <Bell size={48} className="mx-auto mb-3 opacity-20" />
               <p>No hay notificaciones en esta categoría</p>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
