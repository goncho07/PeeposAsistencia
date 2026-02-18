import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  incidentsService,
  Incident,
  IncidentFilters,
} from '@/lib/api/incidents';

export function useIncidents() {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incidentsService.getAll();
      setAllIncidents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar incidencias');
      setAllIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const severityCounts = useMemo(() => ({
    total: allIncidents.length,
    LEVE: allIncidents.filter((i) => i.severity === 'LEVE').length,
    MODERADA: allIncidents.filter((i) => i.severity === 'MODERADA').length,
    GRAVE: allIncidents.filter((i) => i.severity === 'GRAVE').length,
  }), [allIncidents]);

  const filteredIncidents = useMemo(() => {
    let result = allIncidents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.student.full_name.toLowerCase().includes(q) ||
          i.student.document_number?.toLowerCase().includes(q)
      );
    }

    if (filters.classroom_id) {
      result = result.filter((i) => i.classroom_id === filters.classroom_id);
    }

    if (filters.type) {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters.severity) {
      result = result.filter((i) => i.severity === filters.severity);
    }

    return result;
  }, [allIncidents, filters, searchQuery]);

  const updateFilters = useCallback((newFilters: IncidentFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const deleteIncident = useCallback(async (id: number) => {
    try {
      await incidentsService.delete(id);
      setAllIncidents((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar incidencia');
      return false;
    }
  }, []);

  const refreshIncidents = useCallback(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents: filteredIncidents,
    totalCount: allIncidents.length,
    severityCounts,
    isLoading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    updateFilters,
    clearFilters,
    deleteIncident,
    refreshIncidents,
  };
}
