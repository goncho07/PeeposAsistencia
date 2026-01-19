import { useFetchData } from '@/app/hooks';
import { usersService, Student } from '@/lib/api/users';

export function useFetchStudents() {
  const { data, loading, error, refetch } = useFetchData<Student>({
    fetchFn: () => usersService.getStudents(),
    errorMessage: 'Error al cargar estudiantes',
  });

  return {
    students: data,
    loading,
    error,
    refetch,
  };
}
