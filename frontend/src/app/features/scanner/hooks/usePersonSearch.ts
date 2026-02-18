import { useState, useMemo, useEffect, useRef } from 'react';
import { useFetchData, useEntitySearch } from '@/app/hooks';
import { Student, Teacher, User, usersService } from '@/lib/api/users';
import { settingsService } from '@/lib/api/settings';
import type { AttendableType } from '@/lib/api/attendance';

export type PersonType = 'student' | 'teacher' | 'user';
export type Person = (Student | Teacher | User) & { type: PersonType };

export function usePersonSearch() {
  const [allowedTypes, setAllowedTypes] = useState<AttendableType[]>(['student']);
  const [selectedType, setSelectedType] = useState<PersonType>('student');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    settingsService.getAttendableTypes()
      .then((types) => {
        setAllowedTypes(types ?? ['student']);

        if (!types.includes(selectedType)) {
          setSelectedType(types[0] as PersonType);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  const isStudentAllowed = allowedTypes.includes('student');
  const isTeacherAllowed = allowedTypes.includes('teacher');
  const isUserAllowed = allowedTypes.includes('user');

  const {
    data: students,
    loading: loadingStudents,
  } = useFetchData<Student>({
    fetchFn: () => usersService.getStudents({ expand: ['classroom'] }),
    errorMessage: 'Error al cargar estudiantes',
    enabled: isStudentAllowed && !loadingSettings,
  });

  const {
    data: teachers,
    loading: loadingTeachers,
  } = useFetchData<Teacher>({
    fetchFn: () => usersService.getTeachers(),
    errorMessage: 'Error al cargar profesores',
    enabled: isTeacherAllowed && !loadingSettings,
  });

  const {
    data: users,
    loading: loadingUsers,
  } = useFetchData<User>({
    fetchFn: () => usersService.getUsers({ status: 'ACTIVO' }),
    errorMessage: 'Error al cargar personal',
    enabled: isUserAllowed && !loadingSettings,
  });

  const isLoading = loadingSettings ||
    (isStudentAllowed && loadingStudents) ||
    (isTeacherAllowed && loadingTeachers) ||
    (isUserAllowed && loadingUsers);

  useEffect(() => {
    if (!isLoading && !hasLoadedData.current) {
      hasLoadedData.current = true;
    }
  }, [isLoading]);

  const attendableUsers = useMemo(() => {
    return users.filter((u) => u.qr_code);
  }, [users]);

  const persons = useMemo((): Person[] => {
    switch (selectedType) {
      case 'student':
        return students.map((s) => ({ ...s, type: 'student' as PersonType }));
      case 'teacher':
        return teachers.map((t) => ({ ...t, type: 'teacher' as PersonType }));
      case 'user':
        return attendableUsers.map((u) => ({ ...u, type: 'user' as PersonType }));
      default:
        return [];
    }
  }, [selectedType, students, teachers, attendableUsers]);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    goToPage,
    paginatedItems: paginatedPersons,
    totalPages,
    filteredEntities: filteredPersons,
    reset,
  } = useEntitySearch<Person>({
    entities: persons,
    searchFields: (person) => {
      const fields = [person.full_name];

      if ('document_number' in person && person.document_number) {
        fields.push(person.document_number);
      }
      if ('student_code' in person && person.student_code) {
        fields.push(person.student_code);
      }
      if ('email' in person && person.email) {
        fields.push(person.email);
      }

      return fields;
    },
    itemsPerPage: 20,
  });

  useEffect(() => {
    reset();
  }, [selectedType, reset]);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    currentPage,
    setCurrentPage: goToPage,
    allowedTypes,
    students,
    teachers,
    isLoading,
    filteredPersons,
    paginatedPersons,
    totalPages,
  };
}
