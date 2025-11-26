'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface RoleFilterCardProps {
  type: string;
  label: string;
  count: number;
  icon: LucideIcon;
  colorClass: string;
  activeColorClass: string;
  isActive: boolean;
  onClick: () => void;
}

const RoleFilterCard: React.FC<RoleFilterCardProps> = ({ 
  type, 
  label, 
  count,
  icon: Icon, 
  colorClass, 
  activeColorClass,
  isActive,
  onClick
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex flex-col items-start justify-between p-5 rounded-2xl border transition-all duration-300 h-28 w-full shadow-sm overflow-hidden group ${
        isActive 
          ? `${activeColorClass} border-transparent text-white shadow-md` 
          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-600 dark:text-gray-400'
      }`}
    >
      <div className="flex justify-between w-full z-10">
         <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : colorClass.replace('text-', 'bg-').replace('600', '50') + ' ' + colorClass} dark:bg-opacity-20`}>
            <Icon size={20} className={isActive ? 'text-white' : ''} />
         </div>
         <span className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{count}</span>
      </div>
      <span className={`font-semibold text-sm z-10 mt-2 ${isActive ? 'text-white/90' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>{label}</span>
      
      <Icon 
        className={`absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : colorClass}`} 
        size={80} 
        strokeWidth={1.5}
      />
    </motion.button>
  );
};

export default RoleFilterCard;
