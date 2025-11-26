'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MessageCircle, Sparkles, Send, Smile, Paperclip } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
};

export default function MessagingPage() {
  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Centro de Mensajería" subtitle="Comunicaciones automáticas y manuales vía WhatsApp" icon={MessageSquare} gradient="bg-gradient-to-r from-emerald-500 to-teal-600" decorativeIcon={MessageCircle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col"><h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2"><Sparkles size={18} className="text-emerald-500" /> Plantillas Rápidas</h3><div className="space-y-3 flex-1 overflow-y-auto pr-2">{['Recordatorio de Reunión', 'Aviso de Tardanza', 'Evento Escolar', 'Suspensión de Clases', 'Citación Urgente'].map((t, i) => (<motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer transition-all flex justify-between items-center group"><span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{t}</span><Send size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" /></motion.div>))}</div></div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-full"><h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg flex items-center gap-2"><MessageCircle size={18} className="text-emerald-500" /> Redactar Mensaje</h3><div className="relative flex-1 mb-4"><textarea className="w-full h-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-sm border-none outline-none focus:ring-2 focus:ring-emerald-100 dark:text-white resize-none placeholder-gray-400" placeholder="Escriba el mensaje aquí..."></textarea><div className="absolute bottom-3 right-3 flex gap-2"><button className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow"><Smile size={16} /></button><button className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 shadow-sm hover:shadow"><Paperclip size={16} /></button></div></div><button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none">Enviar a Selección <Send size={16} /></button></div>
        </div>
      </motion.div>
    </div>
  );
}