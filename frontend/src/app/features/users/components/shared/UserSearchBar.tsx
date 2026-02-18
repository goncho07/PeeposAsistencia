'use client';
import { Search, CreditCard, PlusIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/base';

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onCarnetClick?: () => void;
}

export function UserSearchBar({
  searchQuery,
  onSearchChange,
  onAddClick,
  onCarnetClick,
}: UserSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xl shadow-sm"
        />
      </div>

      <div className="flex gap-2">
        {onCarnetClick && (
          <Button
            variant="outline"
            onClick={onCarnetClick}
            className="flex-1 sm:flex-none text-xl whitespace-nowrap"
            icon={<CreditCard size={22} />}
          >
            <span className="hidden sm:inline">Generar carnets</span>
            <span className="sm:hidden">Carnets</span>
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={onAddClick}
          className="flex-1 sm:flex-none text-xl whitespace-nowrap"
          icon={<PlusIcon size={22} />}
        >
          Agregar
        </Button> 
      </div>
    </div>
  );
}
