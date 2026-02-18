import { useFetchData } from '@/app/hooks';
import { attendanceService, WeeklyStats } from '@/lib/api/attendance';

export type { WeeklyStats };

export function useWeeklyStats() {
  const { data, loading, error, refetch } = useFetchData<WeeklyStats>({
    fetchFn: async () => {
      const stats = await attendanceService.getWeeklyStats();
      return [stats];
    },
    errorMessage: 'Error al cargar estadísticas semanales',
  });

  return {
    weeklyStats: data[0] || null,
    loading,
    error,
    refetch,
  };
}
