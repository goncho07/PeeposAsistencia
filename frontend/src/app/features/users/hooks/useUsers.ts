import { useState, useEffect, useCallback, useMemo } from 'react';
import { usersService, Student, Teacher, Parent, User, EntityType } from '@/lib/api/users';

export type EntitiesMap = {
  student: Student[];
  teacher: Teacher[];
  parent: Parent[];
  user: User[];
};

export function useUsers() {
  const [entities, setEntities] = useState<EntitiesMap>({
    student: [],
    teacher: [],
    parent: [],
    user: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [students, teachers, parents, users] = await Promise.all([
        usersService.getStudents(),
        usersService.getTeachers(),
        usersService.getParents(),
        usersService.getUsers(),
      ]);

      setEntities({ student: students, teacher: teachers, parent: parents, user: users });
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los datos');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const deleteEntity = useCallback(async (id: number, type: EntityType) => {
    const deleteMap = {
      student: usersService.deleteStudent,
      teacher: usersService.deleteTeacher,
      parent: usersService.deleteParent,
      user: usersService.deleteUser,
    };
    await deleteMap[type](id);
    await fetchAllData();
  }, [fetchAllData]);

  const counts = useMemo(() => ({
    student: entities.student.length,
    teacher: entities.teacher.length,
    parent: entities.parent.length,
    user: entities.user.length,
    total: entities.student.length + entities.teacher.length + entities.parent.length + entities.user.length,
  }), [entities]);

  return { entities, counts, loading, error, fetchAllData, deleteEntity };
}
