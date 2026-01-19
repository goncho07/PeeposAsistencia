import { Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { User as UserIcon, Mail, Phone, Heart, Users, Building2, IdCard, MapPin, Briefcase } from 'lucide-react';
import { DetailCard } from './shared/DetailCard';
import { DetailField } from './shared/DetailField';
import { StatusBadge } from './shared/StatusBadge';

interface InfoTabProps {
  entity: Entity;
  entityType: EntityType;
}

export function InfoTab({ entity, entityType }: InfoTabProps) {
  const student = entityType === 'student' ? (entity as Student) : null;
  const teacher = entityType === 'teacher' ? (entity as Teacher) : null;
  const parent = entityType === 'parent' ? (entity as Parent) : null;
  const user = entityType === 'user' ? (entity as User) : null;

  return (
    <div className="space-y-4">
      <DetailCard title="Información" icon={UserIcon}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {student && (
            <>
              <DetailField label="Código" value={student.student_code} />
              <DetailField
                label="Nacimiento"
                value={new Date(student.birth_date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <DetailField label="Edad" value={`${student.age} años`} />
              <DetailField label="Género" value={student.gender} />
              <div>
                <div className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                  Estado
                </div>
                <StatusBadge status={student.enrollment_status} />
              </div>
            </>
          )}

          {teacher && (
            <>
              <DetailField label="Nivel" value={teacher.level} icon={MapPin} />
              {teacher.email && <DetailField label="Email" value={teacher.email} icon={Mail} />}
              {teacher.phone_number && <DetailField label="Teléfono" value={teacher.phone_number} icon={Phone} />}
              {teacher.area && <DetailField label="Área" value={teacher.area} icon={Briefcase} className="col-span-2" />}
              <div>
                <div className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                  Estado
                </div>
                <StatusBadge status={teacher.status} />
              </div>
            </>
          )}

          {parent && (
            <>
              {parent.email && <DetailField label="Email" value={parent.email} icon={Mail} className="text-xs" />}
              {parent.phone_number && <DetailField label="Teléfono" value={parent.phone_number} icon={Phone} />}
            </>
          )}

          {user && (
            <>
              {user.email && <DetailField label="Email" value={user.email} className="text-xs" />}
              {user.phone_number && <DetailField label="Teléfono" value={user.phone_number} />}
              <div>
                <div className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                  Estado
                </div>
                <StatusBadge status={user.status} />
              </div>
            </>
          )}
        </div>
      </DetailCard>

      {student && student.parents && student.parents.length > 0 && (
        <DetailCard title="Apoderados" icon={Heart}>
          <div className="grid grid-cols-1 gap-3">
            {student.parents.map((parentData: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="font-semibold text-sm text-text-primary dark:text-text-primary-dark">
                    {parentData.full_name}
                  </div>
                  {parentData.relationship.is_primary_contact && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      Principal
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField label="Relación" value={parentData.relationship.type} icon={Heart} size="xs" />
                  {parentData.phone_number && (
                    <DetailField label="Teléfono" value={parentData.phone_number} icon={Phone} size="xs" />
                  )}
                  {parentData.email && (
                    <DetailField label="Email" value={parentData.email} icon={Mail} size="xs" className="col-span-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      {parent && parent.students && parent.students.length > 0 && (
        <DetailCard title="Hijos" icon={Users}>
          <div className="grid grid-cols-1 gap-3">
            {parent.students.map((studentData: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="font-semibold text-sm text-text-primary dark:text-text-primary-dark">
                    {studentData.full_name}
                  </div>
                  <StatusBadge status={studentData.enrollment_status} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField
                    label="Aula"
                    value={studentData.classroom?.full_name || 'Sin aula'}
                    icon={Building2}
                    size="xs"
                  />
                  <DetailField label="Código" value={studentData.student_code} icon={IdCard} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}
    </div>
  );
}
