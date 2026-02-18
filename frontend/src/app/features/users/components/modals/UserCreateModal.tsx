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
import { usersService, Classroom, Student, Parent } from '@/lib/api/users';
import { User, IdCard, GraduationCap, Mail, Users } from 'lucide-react';

export type EntityType = 'student' | 'teacher' | 'parent' | 'user';
type TabType = 'personal' | 'contact' | 'academic' | 'relations' | 'photo';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: EntityType;
  classrooms: Classroom[];
  allParents: Parent[];
  allStudents: Student[];
}

export function UserCreateModal({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  classrooms,
  allParents,
  allStudents,
}: UserCreateModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formData, setFormData] = useState<any>({});
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('personal');
      setFormData(getInitialFormData());
      setSelectedParentIds([]);
      setSelectedStudentIds([]);
      setPhotoFile(null);
      setError('');
    }
  }, [isOpen, entityType]);

  const getInitialFormData = () => {
    const base = {
      name: '',
      paternal_surname: '',
      maternal_surname: '',
      document_type: 'DNI',
      document_number: '',
      birth_date: '',
      gender: 'M',
    };

    if (entityType === 'student') {
      return {
        ...base,
        student_code: '',
        classroom_id: null,
        enrollment_status: 'MATRICULADO',
      };
    }

    if (entityType === 'teacher') {
      return {
        ...base,
        level: '',
        specialty: '',
        email: '',
        phone_number: '',
      };
    }

    if (entityType === 'parent') {
      return {
        ...base,
        phone_number: '',
        email: '',
        address: '',
      };
    }

    if (entityType === 'user') {
      return {
        ...base,
        email: '',
        password: '',
        role: 'secretary',
        phone_number: '',
      };
    }

    return base;
  };

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
      student: 'Nuevo Estudiante',
      teacher: 'Nuevo Docente',
      parent: 'Nuevo Apoderado',
      user: 'Nuevo Usuario',
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
    setLoading(true);
    setError('');

    try {
      const dataToSubmit = {
        ...formData,
        parent_ids: selectedParentIds,
        student_ids: selectedStudentIds,
        photo: photoFile,
      };

      if (entityType === 'student') {
        await usersService.createStudent(dataToSubmit);
      } else if (entityType === 'teacher') {
        await usersService.createTeacher(dataToSubmit);
      } else if (entityType === 'parent') {
        await usersService.createParent(dataToSubmit);
      } else if (entityType === 'user') {
        await usersService.createUser(dataToSubmit);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al crear. Verifica los datos ingresados.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} className='text-xl'>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} className='text-xl'>
            Crear
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
            mode="create"
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
            parents={allParents}
            selectedParentIds={selectedParentIds}
            onToggleParent={toggleParent}
          />
        )}

        {activeTab === 'relations' && entityType === 'parent' && (
          <StudentAssignmentForm
            students={allStudents}
            selectedStudentIds={selectedStudentIds}
            onToggleStudent={toggleStudent}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoUploadForm onPhotoChange={setPhotoFile} />
        )}
      </div>
    </Modal>
  );
}
