import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="flex mb-6 border-b-2 border-border dark:border-border-dark gap-0 bg-surface dark:bg-surface-dark rounded-t-lg overflow-x-auto">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const isFirst = index === 0;
        const isLast = index === tabs.length - 1;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 px-6 py-4 font-semibold transition-all text-base
              flex items-center justify-center gap-2.5 relative
              border-b-4 whitespace-nowrap
              ${isActive
                ? 'text-primary dark:text-primary-light bg-primary/8 dark:bg-primary/10 border-primary dark:border-primary-light font-bold'
                : 'text-text-secondary dark:text-text-secondary-dark bg-transparent border-transparent hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-primary/5 dark:hover:bg-primary/5 hover:border-primary/40 dark:hover:border-primary-light/40'
              }
              ${isFirst ? 'rounded-tl-lg' : ''}
              ${isLast ? 'rounded-tr-lg' : ''}
            `}
          >
            {tab.icon && (
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
