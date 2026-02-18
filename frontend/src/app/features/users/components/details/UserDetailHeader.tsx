import { Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { getStorageUrl } from '@/lib/axios';
import { UserIcon } from 'lucide-react';

interface UserDetailHeaderProps {
  entity: Entity;
  entityType: EntityType;
}

export function UserDetailHeader({ entity, entityType }: UserDetailHeaderProps) {
  const getPhotoUrl = () => {
    if (entityType === 'student') {
      return (entity as Student).photo_url
        ? getStorageUrl((entity as Student).photo_url)
        : null;
    }
    if (entityType === 'user') {
      return (entity as User).photo_url
        ? getStorageUrl((entity as User).photo_url)
        : null;
    }
    return null;
  };

  const getInitials = () => {
    const names = entity.full_name.split(' ');
    return names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleInfo = () => {
    const student = entityType === 'student' ? (entity as Student) : null;
    const teacher = entityType === 'teacher' ? (entity as Teacher) : null;

    if (student && student.classroom) {
      return student.classroom.full_name;
    }
    if (teacher) {
      return teacher.level;
    }
    return entityType === 'parent' ? 'Apoderado' : 'Administrador';
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="flex flex-col items-center text-center gap-3 mb-6 p-6 rounded-xl border border-border bg-background-subtle shadow-sm">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={entity.full_name}
          className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-sm"
        />
      ) : (
        <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary-light/20 dark:to-primary-light/10 border-4 border-border dark:border-border-dark flex items-center justify-center shadow-sm">
          <span className="text-3xl font-semibold text-primary">
            {getInitials()}
          </span>
        </div>
      )}

      <h2 className="text-2xl font-bold text-text-primary">
        {entity.full_name}
      </h2>

      <div className="flex items-center gap-2 justify-center text-primary">
        <UserIcon className="w-4 h-4" />
        <span className="text-lg font-bold uppercase">{getRoleInfo()}</span>
      </div>

      <div className="w-12 h-0.5 bg-primary/30" />

      <div className="text-sm font-semibold text-text-secondary">
        {entity.document_type} {entity.document_number}
      </div>
    </div>
  );
}
