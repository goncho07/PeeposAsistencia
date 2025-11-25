"use client";

import {
  Bell,
  Bot,
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  X,
  Menu,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { AIChatPanel } from "./ai-chat-panel";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/types";

const SidebarItem = ({
  icon: Icon,
  label,
  path,
  active,
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
}) => (
  <Link
    href={path}
    className={`flex flex-col items-center gap-1 py-4 cursor-pointer group relative transition-colors w-full ${
      active
        ? "text-primary"
        : "text-gray-400 dark:text-gray-500 hover:text-primary"
    }`}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
      />
    )}
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-semibold text-center px-1">{label}</span>
  </Link>
);

const NotificationCard = ({
  notification,
}: {
  notification: Notification;
}) => (
  <div className="p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-1">
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          notification.type === "alert"
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : notification.type === "success"
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            : notification.type === "warning"
            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        }`}
      >
        {notification.type === "alert"
          ? "Alerta"
          : notification.type === "success"
          ? "Éxito"
          : notification.type === "warning"
          ? "Aviso"
          : "Info"}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {notification.time}
      </span>
    </div>
    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
      {notification.title}
    </p>
  </div>
);

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

import { Sun, Moon } from "lucide-react";

export function MainLayout({
  children,
  sidebarLogo,
}: {
  children: React.ReactNode;
  sidebarLogo: string;
}) {
  const pathname = usePathname();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const notifications: Notification[] = useMemo(
    () => [
      { id: 1, title: "3 Alumnos sin salida registrada", time: "Hace 10 min", type: "alert" },
      { id: 2, title: "Reporte mensual generado", time: "Hace 1 hora", type: "success" },
      { id: 3, title: "Tardanza recurrente: 5to B", time: "Hace 2 horas", type: "warning" },
    ],
    []
  );

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dash" },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/attendance", icon: ClipboardCheck, label: "Asist" },
    { path: "/reports", icon: BarChart3, label: "Report" },
    { path: "/messaging", icon: MessageSquare, label: "Msj" },
    { path: "/notifications", icon: Bell, label: "Alert" },
    { path: "/settings", icon: Settings, label: "Config" },
  ];

  return (
    <div className="h-screen w-screen bg-background/80 font-body selection:bg-primary/10 overflow-hidden flex relative text-foreground">
      <div className="w-20 md:w-24 flex flex-col items-center py-6 border-r bg-card z-20 shrink-0 h-full">
        <div className="mb-8 w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10 shadow-sm">
          <Image src={sidebarLogo} alt="School Logo" width={64} height={64} className="w-full h-full object-cover" data-ai-hint="school icon"/>
        </div>
        <nav className="flex flex-col gap-2 w-full flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={pathname.startsWith(item.path)}
            />
          ))}
        </nav>
        <div className="mt-4 text-muted-foreground cursor-pointer hover:text-primary p-2" onClick={() => setChatOpen(true)}>
          <Bot size={24} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>

      <AnimatePresence initial={false}>
        {isRightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card border-l h-full overflow-hidden flex flex-col shadow-xl z-30 shrink-0 relative"
          >
            <div className="p-6 flex flex-col h-full w-[320px]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    LL
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Lisha Lokwani</h3>
                    <p className="text-muted-foreground text-xs font-medium">
                      Directora General
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRightPanelOpen(false)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-primary text-xs">
                      Estado del Sistema
                    </h4>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <div className="space-y-2 text-[11px] text-primary/80 dark:text-primary-foreground/70">
                    <div className="flex justify-between">
                      <span>Lectores QR:</span>{" "}
                      <span className="font-bold">En línea (3/3)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WhatsApp API:</span>{" "}
                      <span className="font-bold">Conectado</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                    <Bell size={14} className="text-primary" /> Notificaciones
                  </h4>
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <NotificationCard key={notif.id} notification={notif} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-900 dark:bg-black rounded-xl p-4 text-white relative overflow-hidden">
                <h4 className="font-bold text-sm mb-1 relative z-10">
                  Peepos Móvil
                </h4>
                <p className="text-gray-400 text-[10px] mb-3 relative z-10">
                  Monitoreo en tiempo real
                </p>
                <Button variant="secondary" className="w-full relative z-10 h-8 text-xs">
                  Descargar App
                </Button>
                <Smartphone className="absolute -right-2 -bottom-4 text-gray-700 opacity-50 rotate-12" size={64} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isRightPanelOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute top-6 right-6 p-2.5 bg-card rounded-xl shadow-lg border text-muted-foreground hover:text-primary z-50 hidden md:flex"
          >
            <Menu size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
