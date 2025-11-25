"use client";

import { HeroHeader } from "@/components/app/hero-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/componentsso/ui/textarea";
import { motion } from "framer-motion";
import { MessageCircle, MessageSquare, Paperclip, Send, Smile, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function MessagingPage() {
    const templates = ['Recordatorio de Reunión', 'Aviso de Tardanza', 'Evento Escolar', 'Suspensión de Clases', 'Citación Urgente'];

    return (
        <div className="w-full flex justify-center bg-background min-h-full">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
                <HeroHeader title="Centro de Mensajería" subtitle="Comunicaciones automáticas y manuales vía WhatsApp" icon={MessageSquare} gradient="bg-gradient-to-r from-emerald-500 to-teal-600" decorativeIcon={MessageCircle} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-6 rounded-3xl border shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2"><Sparkles size={18} className="text-emerald-500" /> Plantillas Rápidas</h3>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                            {templates.map((t, i) => (
                                <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-4 rounded-xl bg-muted/40 border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer transition-all flex justify-between items-center group">
                                    <span className="text-sm font-medium text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{t}</span>
                                    <Send size={16} className="text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col h-full">
                        <h3 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2"><MessageCircle size={18} className="text-emerald-500" /> Redactar Mensaje</h3>
                        <div className="relative flex-1 mb-4">
                            <Textarea className="w-full h-full bg-muted/40 rounded-xl p-4 text-sm border-none resize-none placeholder:text-muted-foreground" placeholder="Escriba el mensaje aquí..."></Textarea>
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-emerald-600"><Smile size={16} /></Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-emerald-600"><Paperclip size={16} /></Button>
                            </div>
                        </div>
                        <Button className="w-full py-3 font-bold bg-emerald-600 hover:bg-emerald-700">
                            Enviar a Selección <Send size={16} />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
