'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtext: string;
  trendIcon?: LucideIcon;
  mainIcon: LucideIcon;
  gradient: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtext, 
  trendIcon: TrendIcon, 
  mainIcon: MainIcon, 
  gradient 
}) => (
  <motion.div 
    variants={itemVariants} 
    whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} 
    className={`${gradient} rounded-xl p-6 h-[140px] relative overflow-hidden shadow-sm transition-all duration-300`}
  >
    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12">
      <MainIcon size={100} className="text-white" />
    </div>
    <div className="relative z-10 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <MainIcon size={32} className="text-white opacity-90" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-5xl font-bold text-white tracking-tight">{value}</h3>
        <div className="flex flex-col">
          <span className="text-base font-medium text-white/95">{title}</span>
          <div className="flex items-center gap-1 text-sm text-white/85 mt-1">
            {TrendIcon && <TrendIcon size={16} />}
            <span>{subtext}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default KPICard;
