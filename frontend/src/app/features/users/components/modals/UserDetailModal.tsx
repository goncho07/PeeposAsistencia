'use client';
import { useState } from 'react';
import { Modal, Button } from '@/app/components/ui/base';
import { TabNavigation, Tab } from '../shared/TabNavigation';
import { Entity, EntityType } from '@/lib/api/users';
import { UserDetailHeader } from '../details/UserDetailHeader';
import { InfoTab } from '../details/InfoTab';
import { AcademicTab } from '../details/AcademicTab';
import { ActivityTab } from '../details/ActivityTab';
import { User as UserIcon, GraduationCap, Calendar } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity | null;
  entityType: EntityType;
}

type TabType = 'info' | 'academic' | 'activity';

export function UserDetailModal({
  isOpen,
  onClose,
  entity,
  entityType,
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');

  if (!entity) return null;

  const getTabs = (): Tab[] => {
    const tabs: Tab[] = [
      { id: 'info', label: 'Información', icon: <UserIcon className="w-4 h-4" /> },
    ];

    if (entityType !== 'parent' && entityType !== 'user') {
      tabs.push({
        id: 'academic',
        label: 'Académico',
        icon: <GraduationCap className="w-4 h-4" />,
      });
    }

    if (entityType === 'user') {
      tabs.push({
        id: 'activity',
        label: 'Actividad',
        icon: <Calendar className="w-4 h-4" />,
      });
    }

    return tabs;
  };

  const getModalTitle = () => {
    const typeLabels: Record<EntityType, string> = {
      student: 'Detalles del Estudiante',
      teacher: 'Detalles del Docente',
      parent: 'Detalles del Apoderado',
      user: 'Detalles del Administrador',
    };
    return typeLabels[entityType];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <UserDetailHeader entity={entity} entityType={entityType} />

      <TabNavigation
        tabs={getTabs()}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      <div className="mt-6">
        {activeTab === 'info' && <InfoTab entity={entity} entityType={entityType} />}
        {activeTab === 'academic' && <AcademicTab entity={entity} entityType={entityType} />}
        {activeTab === 'activity' && <ActivityTab entity={entity} entityType={entityType} />}
      </div>
    </Modal>
  );
}
