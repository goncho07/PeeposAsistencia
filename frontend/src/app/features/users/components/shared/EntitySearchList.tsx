import React, { useState, useMemo } from 'react';
import { Input } from '@/app/components/ui/base';
import { Search, Check } from 'lucide-react';

interface EntitySearchListProps<T> {
  entities: T[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  searchPlaceholder: string;
  emptyMessage: string;
  renderItem: (entity: T, isSelected: boolean) => React.ReactNode;
  getEntityId: (entity: T) => number;
  searchFilter: (entity: T, query: string) => boolean;
  maxHeight?: string;
}

export function EntitySearchList<T>({
  entities,
  selectedIds,
  onToggle,
  searchPlaceholder,
  emptyMessage,
  renderItem,
  getEntityId,
  searchFilter,
  maxHeight = 'max-h-64',
}: EntitySearchListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;
    const query = searchQuery.toLowerCase();
    return entities.filter(entity => searchFilter(entity, query));
  }, [entities, searchQuery, searchFilter]);

  return (
    <div className="space-y-4">
      <Input
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={setSearchQuery}
        icon={<Search className="w-4 h-4" />}
      />

      <div className={`${maxHeight} overflow-y-auto space-y-2`}>
        {filteredEntities.length === 0 ? (
          <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">
            {emptyMessage}
          </p>
        ) : (
          filteredEntities.map(entity => {
            const id = getEntityId(entity);
            const isSelected = selectedIds.includes(id);

            return (
              <div
                key={id}
                onClick={() => onToggle(id)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${isSelected
                    ? 'bg-background/10 border-primary dark:bg-primary/20 dark:border-primary-light'
                    : 'bg-background border-border hover:border-primary dark:hover:border-primary-light'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {renderItem(entity, isSelected)}
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary dark:text-primary-light shrink-0 ml-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
          {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
