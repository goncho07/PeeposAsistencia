import { useState, useEffect, useCallback } from 'react';
import {
  incidentsService,
  Incident,
  IncidentFilters,
  IncidentStatistics,
} from '@/lib/api/incidents';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statistics, setStatistics] = useState<IncidentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const fetchIncidents = useCallback(async (currentFilters?: IncidentFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const filtersToUse = currentFilters ?? filters;
      const response = await incidentsService.getAll(filtersToUse);
      setIncidents(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar incidencias');
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStatistics = useCallback(async (classroomId?: number) => {
    try {
      const statsFilters = classroomId ? { classroom_id: classroomId } : undefined;
      const stats = await incidentsService.getStatistics(statsFilters);
      setStatistics(stats);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  const updateFilters = useCallback((newFilters: IncidentFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const deleteIncident = useCallback(async (id: number) => {
    try {
      await incidentsService.delete(id);
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar incidencia');
      return false;
    }
  }, []);

  const refreshIncidents = useCallback(() => {
    fetchIncidents();
    fetchStatistics(filters.classroom_id);
  }, [fetchIncidents, fetchStatistics, filters.classroom_id]);

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  useEffect(() => {
    fetchStatistics(filters.classroom_id);
  }, [filters.classroom_id]);

  return {
    incidents,
    statistics,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    deleteIncident,
    refreshIncidents,
  };
}
