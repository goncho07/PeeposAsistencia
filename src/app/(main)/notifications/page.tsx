"use client";

import { HeroHeader } from "@/components/app/hero-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import type { Notification } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "alert" | "info" | "success" | "warning">("all");

  const allNotifications: Notification[] = [
    { id: 1, title: "3 Alumnos sin salida registrada", time: "Hace 10 min", type: "alert" },
    { id: 2, title: "Reporte mensual generado", time: "Hace 1 hora", type: "success" },
    { id: 3, title: "Tardanza recurrente: 5to B", time: "Hace 2 horas", type: "warning" },
    { id: 4, title: "Reunión de padres programada", time: "Ayer", type: "info" },
    { id: 5, title: "Sistema actualizado correctamente", time: "Ayer", type: "success" },
    { id: 6, title: "Intento de acceso no autorizado", time: "Hace 2 días", type: "alert" },
  ];

  const filtered =
    filter === "all" ? allNotifications : allNotifications.filter((n) => n.type === filter);

  const filterButtons = [
    { id: "all", label: "Todas" },
    { id: "alert", label: "Alertas" },
    { id: "success", label: "Éxitos" },
    { id: "warning", label: "Avisos" },
    { id: "info", label: "Informativos" },
  ] as const;

  return (
    <div className="w-full flex justify-center bg-background min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1024px] px-8 py-6 flex flex-col">
        <HeroHeader
          title="Centro de Notificaciones"
          subtitle="Historial de alertas y avisos del sistema"
          icon={Bell}
          gradient="bg-gradient-to-r from-orange-500 to-red-600"
          decorativeIcon={AlertTriangle}
        />

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filterButtons.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "outline"}
              onClick={() => setFilter(f.id)}
              className="rounded-full font-bold capitalize transition-all"
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((notification) => (
            <motion.div
              key={notification.id}
              variants={itemVariants}
              className="bg-card p-4 rounded-xl border shadow-sm flex items-start gap-4"
            >
              <div
                className={`p-3 rounded-full shrink-0 ${
                  notification.type === "alert"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : notification.type === "success"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : notification.type === "warning"
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {notification.type === "alert" ? (
                  <AlertTriangle size={20} />
                ) : notification.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : notification.type === "warning" ? (
                  <AlertCircle size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground">{notification.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal size={18} />
              </Button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell size={48} className="mx-auto mb-3 opacity-20" />
              <p>No hay notificaciones en esta categoría</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
