import React from 'react';
import { useFetchStudents } from '../../hooks/useFetchStudents';
import { EntitySearchList } from '../shared/EntitySearchList';
import { Spinner, Badge } from '@/app/components/ui/base';
import { GraduationCap } from 'lucide-react';
import { Student } from '@/lib/api/users';

interface StudentAssignmentFormProps {
  selectedStudentIds: number[];
  onToggleStudent: (id: number) => void;
}

export function StudentAssignmentForm({
  selectedStudentIds,
  onToggleStudent,
}: StudentAssignmentFormProps) {
  const { students, loading, error } = useFetchStudents();

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-danger/10 border border-danger text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-primary dark:text-primary-light" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Asignar Estudiantes
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <EntitySearchList<Student>
          entities={students}
          selectedIds={selectedStudentIds}
          onToggle={onToggleStudent}
          searchPlaceholder="Buscar estudiante por nombre o código..."
          emptyMessage="No se encontraron estudiantes"
          getEntityId={(student) => student.id}
          searchFilter={(student, query) => {
            const fullName = student.full_name?.toLowerCase() || '';
            const studentCode = student.student_code?.toLowerCase() || '';
            const docNumber = student.document_number?.toLowerCase() || '';
            return fullName.includes(query) || studentCode.includes(query) || docNumber.includes(query);
          }}
          renderItem={(student, isSelected) => (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-text-primary dark:text-text-primary-dark">
                  {student.full_name}
                </p>
                {student.enrollment_status && (
                  <Badge
                    variant={student.enrollment_status === 'MATRICULADO' ? 'success' : 'secondary'}
                    size="sm"
                  >
                    {student.enrollment_status === 'MATRICULADO' ? 'Activo' : 'Inactivo'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {student.student_code && (
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    {student.student_code}
                  </p>
                )}
                {student.classroom && (
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    {student.classroom.full_name}
                  </p>
                )}
                {student.document_number && (
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    {student.document_type?.toUpperCase()}: {student.document_number}
                  </p>
                )}
              </div>
            </div>
          )}
        />
      )}

      {selectedStudentIds.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary dark:border-primary-light">
          <p className="text-sm text-primary dark:text-primary-light">
            <strong>{selectedStudentIds.length}</strong> estudiante{selectedStudentIds.length !== 1 ? 's' : ''} seleccionado{selectedStudentIds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
