'use client';
import { useState, useEffect } from 'react';
import { Modal, Button } from '@/app/components/ui/base';
import { ParentAssignmentForm, StudentAssignmentForm } from '../forms';
import { usersService, Student, Parent, ParentAssignment, StudentAssignment } from '@/lib/api/users';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entity: Student | Parent | null;
  entityType: 'student' | 'parent';
  allParents: Parent[];
  allStudents: Student[];
}

export function UserEditModal({
  isOpen,
  onClose,
  onSuccess,
  entity,
  entityType,
  allParents,
  allStudents,
}: UserEditModalProps) {
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && entity) {
      setError('');
      if (entityType === 'student') {
        const student = entity as Student;
        setSelectedParentIds(student.parents?.map((p) => p.id) || []);
      } else {
        const parent = entity as Parent;
        setSelectedStudentIds(parent.students?.map((s) => s.id) || []);
      }
    }
  }, [isOpen, entity, entityType]);

  const toggleParent = (id: number) => {
    setSelectedParentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!entity) return;

    setLoading(true);
    setError('');

    try {
      if (entityType === 'student') {
        const student = entity as Student;
        const parents: ParentAssignment[] = selectedParentIds.map(id => {
          const existing = student.parents?.find((p) => p.id === id);
          return {
            parent_id: id,
            relationship_type: existing?.relationship?.type || 'APODERADO',
            is_primary_contact: existing?.relationship?.is_primary_contact ? 1 : 0,
            receives_notifications: existing?.relationship?.receives_notifications ? 1 : 0,
          };
        });
        await usersService.updateStudent(entity.id, { parents });
      } else {
        const parent = entity as Parent;
        const students: StudentAssignment[] = selectedStudentIds.map(id => {
          const existing = parent.students?.find((s) => s.id === id);
          return {
            student_id: id,
            relationship_type: existing?.relationship?.type || 'APODERADO',
            is_primary_contact: existing?.relationship?.is_primary_contact ? 1 : 0,
            receives_notifications: existing?.relationship?.receives_notifications ? 1 : 0,
          };
        });
        await usersService.updateParent(entity.id, { students });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar.';
      const axiosMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMessage || message);
    } finally {
      setLoading(false);
    }
  };

  if (!entity) return null;

  const title = entityType === 'student'
    ? `Asignar Apoderados — ${entity.full_name}`
    : `Asignar Estudiantes — ${entity.full_name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} className='text-xl'>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className='text-xl'>
            Guardar
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-danger/10 border border-danger text-danger">
          {error}
        </div>
      )}

      {entityType === 'student' && (
        <ParentAssignmentForm
          parents={allParents}
          selectedParentIds={selectedParentIds}
          onToggleParent={toggleParent}
        />
      )}

      {entityType === 'parent' && (
        <StudentAssignmentForm
          students={allStudents}
          selectedStudentIds={selectedStudentIds}
          onToggleStudent={toggleStudent}
        />
      )}
    </Modal>
  );
}
