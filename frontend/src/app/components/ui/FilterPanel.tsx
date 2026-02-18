'use client';

import { useState, ReactNode } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
  activeCount: number;
  onClear: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function FilterPanel({ activeCount, onClear, children, actions }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer w-full flex items-center justify-between p-4 rounded-xl bg-surface border border-border"
        >
          <div className="flex items-center gap-3">
            <Filter size={24} className="text-text-secondary" />
            <span className="font-semibold text-xl text-text-primary">Filtros</span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-white">
                {activeCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={24} className="text-text-secondary" />
          ) : (
            <ChevronDown size={24} className="text-text-secondary" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 rounded-xl bg-surface border border-border space-y-4">
            {children}
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-xl font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <X size={26} />
                Limpiar filtros
              </button>
            )}
            {actions}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24 p-5 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Filter size={24} className="text-primary" />
              <span className="font-semibold text-xl text-text-primary">Filtros</span>
            </div>
            {activeCount > 0 && (
              <button
                onClick={onClear}
                className="cursor-pointer flex items-center gap-1 px-2 py-1 text-lg font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <X size={24} />
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-4">
            {children}
          </div>

          {actions}

          {activeCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary">
                {activeCount} filtro{activeCount > 1 ? 's' : ''} activo{activeCount > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
