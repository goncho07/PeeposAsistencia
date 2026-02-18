import { Entity, EntityType, Student, Teacher } from '@/lib/api/users';
import { GraduationCap, Building2, Users } from 'lucide-react';
import { DetailCard } from './shared/DetailCard';
import { DetailField } from './shared/DetailField';

interface AcademicTabProps {
  entity: Entity;
  entityType: EntityType;
}

export function AcademicTab({ entity, entityType }: AcademicTabProps) {
  if (entityType === 'student') {
    const student = entity as Student;
    return (
      <DetailCard title="Información Académica" icon={GraduationCap}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField label="Aula" value={student.classroom?.full_name || 'No asignado'} />
          <DetailField label="Nivel" value={student.classroom?.level || '-'} />
          <DetailField label="Turno" value={student.classroom?.shift || '-'} />
          {student.classroom?.tutor && (
            <DetailField label="Tutor(a)" value={student.classroom.tutor.full_name} />
          )}
        </div>
      </DetailCard>
    );
  }

  if (entityType === 'teacher') {
    const teacher = entity as Teacher;
    return (
      <div className="space-y-4">
        <DetailCard title="Información Profesional" icon={Building2}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <DetailField label="Nivel" value={teacher.level} />
            {teacher.specialty && <DetailField label="Especialidad" value={teacher.specialty} />}
          </div>
        </DetailCard>

        {teacher.classrooms && teacher.classrooms.length > 0 && (
          <DetailCard title={`Aulas Asignadas (${teacher.classrooms.length})`} icon={Users}>
            <div className="grid grid-cols-1 gap-3">
              {teacher.classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="p-4 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark"
                >
                  <div className="font-semibold text-sm mb-3 text-text-primary dark:text-text-primary-dark">
                    {classroom.full_name}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <DetailField label="Nivel" value={classroom.level} size="xs" />
                    <DetailField label="Turno" value={classroom.shift} size="xs" />
                    {classroom.subject && (
                      <DetailField label="Materia" value={classroom.subject} size="xs" />
                    )}
                    {classroom.academic_year && (
                      <DetailField label="Año" value={classroom.academic_year} size="xs" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        )}
      </div>
    );
  }

  return null;
}
