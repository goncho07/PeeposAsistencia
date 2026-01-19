import { useFetchData } from '@/app/hooks';
import { usersService } from '@/lib/api/users';

export interface Classroom {
  id: number;
  full_name: string;
  name: string;
  level: string;
  grade: number;
  section: string;
  shift: string;
  status: string;
}

export function useFetchClassrooms() {
  const { data, loading, error, refetch } = useFetchData<Classroom>({
    fetchFn: () => usersService.getClassrooms(),
    errorMessage: 'Error al cargar aulas',
  });

  return {
    classrooms: data,
    loading,
    error,
    refetch,
  };
}
