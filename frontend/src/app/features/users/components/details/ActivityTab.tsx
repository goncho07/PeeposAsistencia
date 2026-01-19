import { Entity, EntityType, User } from '@/lib/api/users';
import { Calendar } from 'lucide-react';
import { DetailCard } from './shared/DetailCard';

interface ActivityTabProps {
  entity: Entity;
  entityType: EntityType;
}

export function ActivityTab({ entity, entityType }: ActivityTabProps) {
  const user = entityType === 'user' ? (entity as User) : null;

  return (
    <DetailCard title="Actividad Reciente" icon={Calendar}>
      {user?.last_login_at ? (
        <div className="p-4 rounded-lg bg-background dark:bg-background-dark">
          <div className="text-sm font-medium mb-1 text-text-primary dark:text-text-primary-dark">
            Último acceso
          </div>
          <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
            {new Date(user.last_login_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {user.last_login_ip && (
            <div className="text-xs mt-1 text-text-secondary dark:text-text-secondary-dark">
              IP: {user.last_login_ip}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-center py-6 text-text-secondary dark:text-text-secondary-dark">
          Sin actividad registrada
        </p>
      )}
    </DetailCard>
  );
}
