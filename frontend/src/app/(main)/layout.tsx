'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  Bot, 
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatPanel from '@/components/features/AIChatPanel';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: { icon: any, label: string, path: string, active: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1 py-4 cursor-pointer group relative transition-colors w-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'}`}>
    {active && <motion.div layoutId="activeTab" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-500 rounded-r-full" />}
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-semibold text-center px-1">{label}</span>
  </div>
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    if (!isDark) {
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
    { icon: Users, label: 'Users', path: '/usuarios' },
    { icon: ClipboardCheck, label: 'Asist', path: '/asistencia' },
    { icon: BarChart3, label: 'Report', path: '/reportes' },
    { icon: MessageSquare, label: 'Msj', path: '/mensajeria' }, // Ruta corregida
    { icon: Bell, label: 'Alert', path: '/notificaciones' },
    { icon: Settings, label: 'Config', path: '/configuracion' },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-slate-950 font-['Poppins'] overflow-hidden flex relative text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      <div className="w-20 md:w-24 flex flex-col items-center py-6 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0 h-full transition-colors duration-300">
        <div className="mb-8 w-16 h-16 overflow-hidden">
          <img src="/images/logo_palma.png" alt="School Logo" className="w-full h-full object-cover" />
        </div>
        
        <nav className="flex flex-col gap-2 w-full flex-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.label} 
              icon={item.icon} 
              label={item.label} 
              path={item.path}
              active={pathname.startsWith(item.path)} 
              onClick={() => router.push(item.path)} 
            />
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-4 items-center mb-4">
             <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 p-2" onClick={() => setChatOpen(true)}>
                <Bot size={24} />
            </div>
        </div>
      </div>

      {/* Middle Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50/30 dark:bg-slate-950 transition-colors duration-300">
        {/* Mobile Header */}
        <header className="h-16 px-6 flex justify-between items-center shrink-0 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm md:hidden transition-colors duration-300">
            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center gap-2">Peepos</div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
        </header>

        {/* Dynamic Content (Pages) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-0">
           {children}
        </div>
      </div>

      {/* AI Chat Panel (Global) */}
      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}