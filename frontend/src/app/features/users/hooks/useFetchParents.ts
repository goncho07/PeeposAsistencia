import { useFetchData } from '@/app/hooks';
import { usersService, Parent } from '@/lib/api/users';

export function useFetchParents() {
  const { data, loading, error, refetch } = useFetchData<Parent>({
    fetchFn: () => usersService.getParents(),
    errorMessage: 'Error al cargar apoderados',
  });

  return {
    parents: data,
    loading,
    error,
    refetch,
  };
}
