import { useFetchData } from '@/app/hooks';
import { usersService, Classroom } from '@/lib/api/users';

export type { Classroom };

export function useFetchClassrooms(enabled: boolean = true) {
  const { data, loading, error, refetch } = useFetchData<Classroom>({
    fetchFn: () => usersService.getClassrooms({ fields: 'minimal' }),
    errorMessage: 'Error al cargar aulas',
    enabled,
  });

  return {
    classrooms: data,
    loading,
    error,
    refetch,
  };
}
