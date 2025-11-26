'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Loader2 } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import NotificationCard, { Notification } from '@/components/ui/NotificationCard';
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

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'alert' | 'info' | 'success'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        // Mapear datos del backend al formato del frontend si es necesario
        // Por ahora asumimos que el backend devuelve la estructura correcta o similar
        const mapped = data.map((n: any) => ({
            id: n.id,
            title: n.title || n.message || "Notificación del sistema",
            time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: n.type || 'info'
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter || (filter === 'info' && (n.type === 'info' || n.type === 'warning'))); 

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col space-y-8">
        
        <section>
            <HeroHeader 
            title="Centro de Notificaciones" 
            subtitle="Historial de alertas y avisos del sistema" 
            icon={Bell} 
            gradient="bg-gradient-to-r from-orange-500 to-red-600" 
            decorativeIcon={AlertTriangle} 
            />
            
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
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
                <>
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
                </>
            )}
            </div>
        </section>

      </motion.div>
    </div>
  );
}