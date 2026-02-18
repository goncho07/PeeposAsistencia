import { useState, useMemo, useCallback } from 'react';
import { usePagination } from './usePagination';

interface UseEntitySearchOptions<T> {
  entities: T[];
  searchFields: (entity: T) => string[];
  filterFn?: (entity: T, filters: any) => boolean;
  itemsPerPage?: number;
}

export function useEntitySearch<T>({
  entities,
  searchFields,
  filterFn,
  itemsPerPage = 10,
}: UseEntitySearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});

  const filteredEntities = useMemo(() => {
    let result = entities;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((entity) =>
        searchFields(entity).some((field) =>
          field.toLowerCase().includes(query)
        )
      );
    }

    if (filterFn) {
      result = result.filter((entity) => filterFn(entity, filters));
    }

    return result;
  }, [entities, searchQuery, filters, searchFields, filterFn]);

  const pagination = usePagination(filteredEntities, itemsPerPage);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      pagination.reset();
    },
    [pagination]
  );

  const handleFilter = useCallback(
    (newFilters: any) => {
      setFilters(newFilters);
      pagination.reset();
    },
    [pagination]
  );

  return {
    searchQuery,
    setSearchQuery: handleSearch,
    filters,
    setFilters: handleFilter,
    filteredEntities,
    ...pagination,
  };
}
