'use client';
import { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className = '',
}: TabsProps) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-5 py-2.5 gap-2',
  };

  return (
    <div
      className={`
        flex gap-2 w-full sm:w-auto bg-card rounded-xl p-2
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 inline-flex items-center justify-center font-black rounded-lg
              transition-all duration-200 focus:outline-none whitespace-nowrap cursor-pointer
              ${sizeClasses[size]}
              ${isActive
                ? 'bg-surface text-primary shadow-sm scale-[1.01]'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
