'use client';
import { useState, useEffect } from 'react';
import { Modal, Button } from '@/app/components/ui/base';
import { TabNavigation, Tab } from '../shared/TabNavigation';
import {
  PersonalInfoForm,
  ContactInfoForm,
  AcademicInfoForm,
  ParentAssignmentForm,
  StudentAssignmentForm,
  PhotoUploadForm,
} from '../forms';
import { useFetchClassrooms } from '../../hooks/useFetchClassrooms';
import { usersService } from '@/lib/api/users';
import { Student, Teacher, Parent, User as UserType } from '@/lib/api/users';
import { User, IdCard, GraduationCap, Mail, Users } from 'lucide-react';

export type EntityType = 'student' | 'teacher' | 'parent' | 'user';
export type Entity = Student | Teacher | Parent | UserType;
type TabType = 'personal' | 'contact' | 'academic' | 'relations' | 'photo';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entity: Entity | null;
  entityType: EntityType;
}

export function UserEditModal({
  isOpen,
  onClose,
  onSuccess,
  entity,
  entityType,
}: UserEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formData, setFormData] = useState<any>({});
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [_photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { classrooms } = useFetchClassrooms();

  useEffect(() => {
    if (isOpen && entity) {
      setActiveTab('personal');
      setFormData(entity);
      setError('');
      setPhotoFile(null);

      if (entityType === 'student' && 'parents' in entity) {
        const parentIds = entity.parents?.map((p: any) => p.id) || [];
        setSelectedParentIds(parentIds);
      }

      if (entityType === 'parent' && 'students' in entity) {
        const studentIds = entity.students?.map((s: any) => s.id) || [];
        setSelectedStudentIds(studentIds);
      }
    }
  }, [isOpen, entity, entityType]);

  const getTabs = (): Tab[] => {
    const tabs: Tab[] = [
      { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    ];

    if (entityType === 'student') {
      tabs.push(
        { id: 'academic', label: 'Académico', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'relations', label: 'Apoderados', icon: <Users className="w-4 h-4" /> },
        { id: 'photo', label: 'Foto', icon: <IdCard className="w-4 h-4" /> }
      );
    } else if (entityType === 'teacher') {
      tabs.push(
        { id: 'academic', label: 'Profesional', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'contact', label: 'Contacto', icon: <Mail className="w-4 h-4" /> },
        { id: 'photo', label: 'Foto', icon: <IdCard className="w-4 h-4" /> }
      );
    } else if (entityType === 'parent') {
      tabs.push(
        { id: 'contact', label: 'Contacto', icon: <Mail className="w-4 h-4" /> },
        { id: 'relations', label: 'Hijos', icon: <Users className="w-4 h-4" /> },
        { id: 'photo', label: 'Foto', icon: <IdCard className="w-4 h-4" /> }
      );
    } else if (entityType === 'user') {
      tabs.push(
        { id: 'contact', label: 'Contacto', icon: <Mail className="w-4 h-4" /> },
        { id: 'photo', label: 'Foto', icon: <IdCard className="w-4 h-4" /> }
      );
    }

    return tabs;
  };

  const getModalTitle = () => {
    const titles: Record<EntityType, string> = {
      student: 'Editar Estudiante',
      teacher: 'Editar Docente',
      parent: 'Editar Apoderado',
      user: 'Editar Usuario',
    };
    return titles[entityType];
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

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
      const dataToSubmit = {
        ...formData,
        parent_ids: selectedParentIds,
        student_ids: selectedStudentIds,
      };

      if (entityType === 'student') {
        await usersService.updateStudent(entity.id, dataToSubmit);
      } else if (entityType === 'teacher') {
        await usersService.updateTeacher(entity.id, dataToSubmit);
      } else if (entityType === 'parent') {
        await usersService.updateParent(entity.id, dataToSubmit);
      } else if (entityType === 'user') {
        await usersService.updateUser(entity.id, dataToSubmit);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al actualizar. Verifica los datos ingresados.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!entity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Guardar Cambios
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-danger/10 border border-danger text-danger">
          {error}
        </div>
      )}

      <TabNavigation tabs={getTabs()} activeTab={activeTab} onChange={(tabId) => setActiveTab(tabId as TabType)} />

      <div className="mt-6">
        {activeTab === 'personal' && (
          <PersonalInfoForm
            data={formData}
            onChange={handleFieldChange}
            userType={entityType}
            mode="edit"
          />
        )}

        {activeTab === 'contact' && (
          <ContactInfoForm
            data={formData}
            onChange={handleFieldChange}
            userType={entityType}
          />
        )}

        {activeTab === 'academic' && (
          <AcademicInfoForm
            data={formData}
            classrooms={classrooms}
            onChange={handleFieldChange}
            userType={entityType as 'student' | 'teacher'}
          />
        )}

        {activeTab === 'relations' && entityType === 'student' && (
          <ParentAssignmentForm
            selectedParentIds={selectedParentIds}
            onToggleParent={toggleParent}
          />
        )}

        {activeTab === 'relations' && entityType === 'parent' && (
          <StudentAssignmentForm
            selectedStudentIds={selectedStudentIds}
            onToggleStudent={toggleStudent}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoUploadForm
            currentPhotoUrl={entity.photo_url || undefined}
            onPhotoChange={setPhotoFile}
          />
        )}
      </div>
    </Modal>
  );
}
