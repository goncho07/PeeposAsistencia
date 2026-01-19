import { useState, useMemo, useEffect, useRef } from 'react';
import { useFetchData, useEntitySearch } from '@/app/hooks';
import { Student, Teacher, usersService } from '@/lib/api/users';

export type PersonType = 'student' | 'teacher';
export type Person = (Student | Teacher) & { type: PersonType };

export function usePersonSearch() {
  const [selectedType, setSelectedType] = useState<PersonType>('student');
  const hasLoadedData = useRef(false);

  const {
    data: students,
    loading: loadingStudents,
    error: studentsError,
  } = useFetchData<Student>({
    fetchFn: () => usersService.getStudents(),
    errorMessage: 'Error al cargar estudiantes',
  });

  const {
    data: teachers,
    loading: loadingTeachers,
    error: teachersError,
  } = useFetchData<Teacher>({
    fetchFn: () => usersService.getTeachers(),
    errorMessage: 'Error al cargar profesores',
  });

  const isLoading = loadingStudents || loadingTeachers;
  const error = studentsError || teachersError;

  useEffect(() => {
    if (!isLoading && !hasLoadedData.current) {
      hasLoadedData.current = true;
    }
  }, [isLoading]);

  const persons = useMemo((): Person[] => {
    return selectedType === 'student'
      ? students.map((s) => ({ ...s, type: 'student' as PersonType }))
      : teachers.map((t) => ({ ...t, type: 'teacher' as PersonType }));
  }, [selectedType, students, teachers]);

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

      if ('dni' in person && person.dni) {
        fields.push(person.dni);
      }
      if ('document_number' in person && person.document_number) {
        fields.push(person.document_number);
      }
      if ('student_code' in person && person.student_code) {
        fields.push(person.student_code);
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
    students,
    teachers,
    isLoading,
    error,
    filteredPersons,
    paginatedPersons,
    totalPages,
  };
}
