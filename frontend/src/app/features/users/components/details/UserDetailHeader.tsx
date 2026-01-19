import { Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { getStorageUrl } from '@/lib/axios';

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

  const getSubtitle = () => {
    const student = entityType === 'student' ? (entity as Student) : null;
    const teacher = entityType === 'teacher' ? (entity as Teacher) : null;
    const parent = entityType === 'parent' ? (entity as Parent) : null;
    const user = entityType === 'user' ? (entity as User) : null;

    if (student) return `DNI ${student.document_number}`;
    if (teacher) return `DNI ${teacher.dni}`;
    if (parent) return `${parent.document_type} ${parent.document_number}`;
    if (user) return `DNI ${user.dni}`;
    return '';
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
    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border dark:border-border-dark">
      <div className="shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={entity.full_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-border dark:border-border-dark"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 dark:from-primary-light/20 dark:to-primary-light/10 border-4 border-border dark:border-border-dark flex items-center justify-center">
            <span className="text-2xl font-bold text-primary dark:text-primary-light">
              {getInitials()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold mb-1 text-text-primary dark:text-text-primary-dark">
          {entity.full_name}
        </h2>
        <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
          {getRoleInfo()} • {getSubtitle()}
        </div>
      </div>
    </div>
  );
}
