'use client';

import React, { useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { PersonalInfoForm, RelationshipManager } from '@/app/components/forms';
import { useEntityData, useRelationships, useFormData } from '@/app/hooks';
import axios from '@/lib/axios';

interface TestUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  userType: 'student' | 'parent' | 'teacher';
  initialData?: any;
}

const TestUserFormModal: React.FC<TestUserFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  userType,
  initialData,
}) => {
  // Initial form data based on user type
  const getInitialFormData = () => {
    if (mode === 'edit' && initialData) {
      return { ...initialData };
    }

    const baseData = {
      name: '',
      paternal_surname: '',
      maternal_surname: '',
      document_type: 'DNI',
      document_number: '',
    };

    if (userType === 'student') {
      return {
        ...baseData,
        student_code: '',
        gender: '',
        birth_date: '',
        enrollment_status: 'MATRICULADO',
        classroom_id: '',
      };
    }

    if (userType === 'parent' || userType === 'teacher') {
      return {
        ...baseData,
        phone_number: '',
        email: '',
        ...(userType === 'teacher' && { specialization: '' }),
      };
    }

    return baseData;
  };

  // Form data hook
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  } = useFormData({
    initialData: getInitialFormData(),
    onSubmit: async (data) => {
      const endpoint = userType === 'student' ? '/students' :
                      userType === 'parent' ? '/parents' :
                      '/teachers';

      // Preparar datos según el tipo
      const submitData = { ...data };

      // Agregar relaciones si aplica
      if (userType === 'student' && parentRelations.relations.length > 0) {
        submitData.parents = parentRelations.getRelationsForSubmit();
      }

      if (userType === 'parent' && studentRelations.relations.length > 0) {
        submitData.students = studentRelations.getRelationsForSubmit();
      }

      if (mode === 'create') {
        await axios.post(endpoint, submitData);
      } else {
        await axios.put(`${endpoint}/${initialData.id}`, submitData);
      }

      onClose();
    },
  });

  // Load available parents and students
  const { data: availableParents } = useEntityData({
    endpoint: '/parents',
    enabled: userType === 'student',
  });

  const { data: availableStudents } = useEntityData({
    endpoint: '/students',
    enabled: userType === 'parent',
  });

  // Parent relationships (for students)
  const parentRelations = useRelationships({
    initialRelations: mode === 'edit' && userType === 'student' ? initialData?.parents || [] : [],
    maxCount: 5,
    relationType: 'parent',
  });

  // Student relationships (for parents)
  const studentRelations = useRelationships({
    initialRelations: mode === 'edit' && userType === 'parent' ? initialData?.students || [] : [],
    maxCount: 10,
    relationType: 'student',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const modalTitle = mode === 'create'
    ? `Crear ${userType === 'student' ? 'Estudiante' : userType === 'parent' ? 'Apoderado' : 'Docente'}`
    : `Editar ${userType === 'student' ? 'Estudiante' : userType === 'parent' ? 'Apoderado' : 'Docente'}`;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information Form */}
          <PersonalInfoForm
            formData={formData}
            onChange={handleChange}
            errors={errors}
            mode={mode}
            currentValues={initialData}
            entityType={userType}
          />

          {/* Parent Relationships (for students) */}
          {userType === 'student' && (
            <RelationshipManager
              relations={parentRelations.relations}
              availableEntities={availableParents}
              entityType="parent"
              searchQuery={parentRelations.searchQuery}
              onSearchChange={parentRelations.setSearchQuery}
              onAdd={parentRelations.addRelation}
              onRemove={parentRelations.removeRelation}
              onUpdate={parentRelations.updateRelation}
              canAddMore={parentRelations.canAddMore}
              maxCount={5}
              errors={errors}
            />
          )}

          {/* Student Relationships (for parents) */}
          {userType === 'parent' && (
            <RelationshipManager
              relations={studentRelations.relations}
              availableEntities={availableStudents}
              entityType="student"
              searchQuery={studentRelations.searchQuery}
              onSearchChange={studentRelations.setSearchQuery}
              onAdd={studentRelations.addRelation}
              onRemove={studentRelations.removeRelation}
              onUpdate={studentRelations.updateRelation}
              canAddMore={studentRelations.canAddMore}
              maxCount={10}
              errors={errors}
            />
          )}
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default TestUserFormModal;
