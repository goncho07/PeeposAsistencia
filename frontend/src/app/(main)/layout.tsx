'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  MessageSquare, 
  Bell, 
  Settings, 
  Bot, 
  QrCode, 
  Menu, 
  X,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';
import NotificationCard, { Notification } from '@/components/ui/NotificationCard';

// Componente SidebarItem interno
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1 py-4 cursor-pointer group relative transition-colors w-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'}`}>
    {active && <motion.div layoutId="activeTab" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-r-full" />}
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-semibold text-center px-1">{label}</span>
  </div>
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle Theme Function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const notifications: Notification[] = [
    { id: 1, title: "3 Alumnos sin salida registrada", time: "Hace 10 min", type: "alert" },
    { id: 2, title: "Reporte mensual generado", time: "Hace 1 hora", type: "success" },
    { id: 3, title: "Tardanza recurrente: 5to B", time: "Hace 2 horas", type: "warning" },
  ];

  const sidebarLogo = 'https://media.discordapp.net/attachments/1383264716536680462/1425322396478607410/image_4.png?ex=69227dec&is=69212c6c&hm=036843954144dbc970762b423da8ab79ff65edf955c979734653a0b3e8272857&=&format=webp&quality=lossless&width=864&height=864';

  return (
    <div className={`h-screen w-screen bg-gray-50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 overflow-hidden flex relative text-gray-800 dark:text-gray-100 ${darkMode ? 'dark' : ''}`}>
        
        {/* Sidebar Navigation */}
        <div className="w-20 md:w-24 flex flex-col items-center py-6 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0 h-full">
          <div className="mb-8 w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-sm">
             <img src={sidebarLogo} alt="School Logo" className="w-full h-full object-cover" />
          </div>
          <nav className="flex flex-col gap-2 w-full flex-1 overflow-y-auto scrollbar-hide">
            <SidebarItem icon={LayoutDashboard} label="Dash" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} />
            <SidebarItem icon={Users} label="Users" active={pathname === '/users'} onClick={() => router.push('/users')} />
            <SidebarItem icon={ClipboardCheck} label="Asist" active={pathname === '/attendance'} onClick={() => router.push('/attendance')} />
            <SidebarItem icon={BarChart3} label="Report" active={pathname === '/reports'} onClick={() => router.push('/reports')} />
            <SidebarItem icon={MessageSquare} label="Msj" active={pathname === '/messaging'} onClick={() => router.push('/messaging')} />
            <SidebarItem icon={Bell} label="Alert" active={pathname === '/notifications'} onClick={() => router.push('/notifications')} />
            <SidebarItem icon={Settings} label="Config" active={pathname === '/settings'} onClick={() => router.push('/settings')} />
          </nav>
          <div className="mt-4 text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 p-2">
            <Bot size={24} />
          </div>
        </div>

        {/* Middle Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50/30 dark:bg-slate-950">
          <header className="h-16 px-6 flex justify-between items-center shrink-0 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm md:hidden">
              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center gap-2">
                <QrCode size={24} /> Peepos
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {!isRightPanelOpen && (
                   <button onClick={() => setIsRightPanelOpen(true)} className="p-2 text-gray-600 dark:text-gray-300"><Menu size={24} /></button>
                )}
              </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
             {children}
          </div>
        </div>

        {/* Collapsible Right Sidebar */}
        <AnimatePresence initial={false}>
          {isRightPanelOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }} 
              animate={{ width: 320, opacity: 1 }} 
              exit={{ width: 0, opacity: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 h-full overflow-hidden flex flex-col shadow-xl z-30 shrink-0 relative"
            >
              <div className="p-6 flex flex-col h-full w-[320px]">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md">LL</div>
                    <div><h3 className="font-bold text-gray-800 dark:text-white text-sm">Lisha Lokwani</h3><p className="text-gray-400 text-xs font-medium">Directora General</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                      </button>
                     <button onClick={() => setIsRightPanelOpen(false)} className="p-1.5 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><X size={18} /></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs">Estado del Sistema</h4>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="space-y-2 text-[11px] text-blue-600/80 dark:text-blue-300/80">
                      <div className="flex justify-between"><span>Lectores QR:</span> <span className="font-bold">En línea (3/3)</span></div>
                      <div className="flex justify-between"><span>WhatsApp API:</span> <span className="font-bold">Conectado</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm"><Bell size={14} className="text-blue-600 dark:text-blue-400"/> Notificaciones</h4>
                    <div className="space-y-2">
                      {notifications.map(notif => (<NotificationCard key={notif.id} notification={notif} />))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-gray-900 dark:bg-black rounded-xl p-4 text-white relative overflow-hidden">
                  <h4 className="font-bold text-sm mb-1 relative z-10">Peepos Móvil</h4>
                  <p className="text-gray-400 text-[10px] mb-3 relative z-10">Monitoreo en tiempo real</p>
                  <button className="bg-white text-gray-900 text-[10px] font-bold py-2 px-4 rounded-lg w-full relative z-10 hover:bg-gray-200 transition-colors">Descargar App</button>
                  <Smartphone className="absolute -right-2 -bottom-4 text-gray-700 opacity-50 rotate-12" size={64} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Floating Toggle Button */}
        <AnimatePresence>
          {!isRightPanelOpen && (
            <motion.button 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0 }} 
              onClick={() => setIsRightPanelOpen(true)} 
              className="absolute top-6 right-6 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 z-50 hidden md:flex"
            >
              <Menu size={20} />
            </motion.button>
          )}
        </AnimatePresence>
    </div>
  );
}
