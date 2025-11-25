'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  decorativeIcon?: LucideIcon;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  gradient, 
  decorativeIcon: DecorativeIcon 
}) => {
  const Decor = DecorativeIcon || Icon;
  return (
    <div className={`${gradient} rounded-[32px] p-8 text-white shadow-lg shadow-gray-200 dark:shadow-none relative overflow-hidden mb-8`}>
      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
           <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
             <Icon size={24} className="text-white"/>
           </div>
           <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <p className="text-white/90 text-sm max-w-xl font-medium pl-[52px]">{subtitle}</p>
      </div>
      <Decor className="absolute -right-6 -bottom-8 text-white opacity-20 rotate-12" size={140} strokeWidth={1.5} />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
};

export default HeroHeader;
