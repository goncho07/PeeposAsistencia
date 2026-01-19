import { useEffect, useMemo, useState, useCallback } from 'react';
import { Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { FilterValues } from '../components/shared/UserFilters';

const ITEMS_PER_PAGE = 10;

export function useUserSearch(entities: Entity[], entityType: EntityType) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
  }, [entityType]);

  const filteredByFilters = useMemo(() => {
    return entities.filter((entity) => {
      switch (entityType) {
        case 'student': {
          const student = entity as Student;
          if (filters.level && student.classroom?.level !== filters.level) return false;
          if (filters.grade && student.classroom?.grade.toString() !== filters.grade) return false;
          if (filters.section && student.classroom?.section !== filters.section) return false;
          if (filters.enrollmentStatus && student.enrollment_status !== filters.enrollmentStatus) return false;
          return true;
        }
        case 'teacher': {
          const teacher = entity as Teacher;
          if (filters.level && teacher.level !== filters.level) return false;
          if (filters.area && teacher.area !== filters.area) return false;
          if (filters.status && teacher.status !== filters.status) return false;
          return true;
        }
        case 'parent': {
          const parent = entity as Parent;
          if (filters.documentType && parent.document_type !== filters.documentType) return false;
          return true;
        }
        case 'user': {
          const user = entity as User;
          if (filters.role && user.role !== filters.role) return false;
          if (filters.status && user.status !== filters.status) return false;
          return true;
        }
        default:
          return true;
      }
    });
  }, [entities, entityType, filters]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return filteredByFilters;

    const query = searchQuery.toLowerCase().trim();

    return filteredByFilters.filter((entity) => {
      const searchableFields: string[] = [entity.full_name];

      if (entityType === 'student') {
        const student = entity as Student;
        searchableFields.push(student.student_code || '');
        if (student.classroom) {
          searchableFields.push(
            student.classroom.level,
            student.classroom.grade.toString(),
            student.classroom.section,
            student.classroom.full_name
          );
        }
      } else if (entityType === 'teacher') {
        const teacher = entity as Teacher;
        searchableFields.push(teacher.dni || '', teacher.level || '', teacher.area || '');
      } else if (entityType === 'parent') {
        const parent = entity as Parent;
        searchableFields.push(parent.document_number || '', parent.phone_number || '');
      } else if (entityType === 'user') {
        const user = entity as User;
        searchableFields.push(user.dni || '', user.role || '');
      }

      return searchableFields.some((field) => field?.toLowerCase().includes(query));
    });
  }, [filteredByFilters, searchQuery, entityType]);

  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntities, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const updateFilters = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters: updateFilters,
    currentPage,
    setCurrentPage,
    filteredEntities,
    paginatedEntities,
    totalPages,
    totalFiltered: filteredEntities.length,
  };
}
