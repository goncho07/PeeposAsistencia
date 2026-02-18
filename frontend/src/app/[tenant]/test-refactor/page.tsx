'use client';

import React, { useState } from 'react';
import TestUserFormModal from '@/app/components/modals/TestUserFormModal';

export default function TestRefactorPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    mode: 'create' | 'edit';
    userType: 'student' | 'parent' | 'teacher';
  }>({
    mode: 'create',
    userType: 'student',
  });

  const openModal = (mode: 'create' | 'edit', userType: 'student' | 'parent' | 'teacher') => {
    setModalConfig({ mode, userType });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Prueba de Componentes Refactorizados</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Crear (Create Mode)</h2>
        <div className="flex gap-4">
          <button
            onClick={() => openModal('create', 'student')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crear Estudiante
          </button>
          <button
            onClick={() => openModal('create', 'parent')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Crear Apoderado
          </button>
          <button
            onClick={() => openModal('create', 'teacher')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Crear Docente
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Editar (Edit Mode)</h2>
        <div className="flex gap-4">
          <button
            onClick={() => openModal('edit', 'student')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Editar Estudiante
          </button>
          <button
            onClick={() => openModal('edit', 'parent')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Editar Apoderado
          </button>
          <button
            onClick={() => openModal('edit', 'teacher')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Editar Docente
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h3 className="font-semibold mb-2">Componentes probados:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ FormField - Campos de entrada reutilizables</li>
          <li>✅ FormSelect - Selectores reutilizables</li>
          <li>✅ FormSection - Secciones con íconos</li>
          <li>✅ PersonalInfoForm - Formulario de información personal</li>
          <li>✅ RelationshipManager - Gestor de relaciones con búsqueda</li>
          <li>✅ useEntityData - Hook para cargar datos</li>
          <li>✅ useFormData - Hook para manejar formularios</li>
          <li>✅ useRelationships - Hook para manejar relaciones</li>
          <li>✅ formFieldsConfig - Configuraciones compartidas</li>
        </ul>
      </div>

      <TestUserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalConfig.mode}
        userType={modalConfig.userType}
      />
    </div>
  );
}
