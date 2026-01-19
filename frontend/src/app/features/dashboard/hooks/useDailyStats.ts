import { useFetchData } from '@/app/hooks';
import { attendanceService, DailyStats } from '@/lib/api/attendance';

export type { DailyStats };

export function useDailyStats() {
  const { data, loading, error, refetch } = useFetchData<DailyStats>({
    fetchFn: async () => {
      const stats = await attendanceService.getDailyStats();
      return [stats];
    },
    errorMessage: 'Error al cargar estadísticas',
  });

  return {
    stats: data[0] || null,
    loading,
    error,
    refetch,
  };
}
