'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  iconColor?: string; // e.g., 'text-blue-600'
  onClick: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, iconColor, onClick }) => (
  <motion.button 
    variants={itemVariants} 
    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} 
    whileTap={{ scale: 0.98 }} 
    onClick={onClick} 
    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl h-[120px] p-5 flex flex-col items-center justify-center gap-3 hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-200 w-full shadow-sm cursor-pointer group"
  >
    <div className={`p-3 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors ${iconColor}`}>
      <Icon size={32} />
    </div>
    <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
      {label}
    </span>
  </motion.button>
);

export default ActionButton;
