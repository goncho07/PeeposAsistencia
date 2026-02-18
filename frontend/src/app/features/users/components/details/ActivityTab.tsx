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
        <div className="rounded-lg bg-background">
          <div className="text-lg font-medium mb-1 text-text-primary">
            Último acceso
          </div>
          <div className="text-lg text-text-secondary font-medium">
            {new Date(user.last_login_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {user.last_login_ip && (
            <div className="text-lg mt-1 text-text-secondary">
              IP: {user.last_login_ip}
            </div>
          )}
        </div>
      ) : (
        <p className="text-lg text-center py-6 text-text-secondary dark:text-text-secondary-dark">
          Sin actividad registrada
        </p>
      )}
    </DetailCard>
  );
}
