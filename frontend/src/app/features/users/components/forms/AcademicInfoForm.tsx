import React from 'react';
import { Input, Select } from '@/app/components/ui/base';
import { Classroom } from '../../hooks/useFetchClassrooms';
import { GraduationCap, BookOpen } from 'lucide-react';

interface AcademicInfoFormProps {
  data: {
    classroom_id?: number;
    student_code?: string;
    enrollment_status?: string;
    level?: string;
    specialty?: string;
  };
  classrooms: Classroom[];
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  userType: 'student' | 'teacher';
}

export function AcademicInfoForm({
  data,
  classrooms,
  onChange,
  errors = {},
  userType,
}: AcademicInfoFormProps) {
  return (
    <div className="space-y-4">
      {userType === 'student' && (
        <>
          <Select
            label="Aula"
            options={[
              { value: '', label: 'Seleccione un aula' },
              ...classrooms.map(c => ({
                value: c.id,
                label: c.full_name || `${c.level} ${c.grade}° ${c.section}`,
              }))
            ]}
            value={data.classroom_id || ''}
            onChange={(v) => onChange('classroom_id', v ? Number(v) : null)}
            error={errors.classroom_id}
            required
          />

          <Input
            label="Código de Estudiante"
            type="text"
            value={data.student_code || ''}
            onChange={(v) => onChange('student_code', v)}
            error={errors.student_code}
            placeholder="Ej: EST2024001"
            icon={<GraduationCap className="w-4 h-4" />}
            required
          />

          <Select
            label="Estado de Matrícula"
            options={[
              { value: 'MATRICULADO', label: 'Matriculado' },
              { value: 'RETIRADO', label: 'Retirado' },
              { value: 'TRASLADADO', label: 'Trasladado' },
              { value: 'EGRESADO', label: 'Egresado' },
            ]}
            value={data.enrollment_status || 'MATRICULADO'}
            onChange={(v) => onChange('enrollment_status', v as string)}
            error={errors.enrollment_status}
          />
        </>
      )}

      {userType === 'teacher' && (
        <>
          <Select
            label="Nivel Educativo"
            options={[
              { value: 'INICIAL', label: 'Inicial' },
              { value: 'PRIMARIA', label: 'Primaria' },
              { value: 'SECUNDARIA', label: 'Secundaria' },
            ]}
            value={data.level || ''}
            onChange={(v) => onChange('level', v as string)}
            error={errors.level}
            placeholder="Seleccione un nivel"
            required
          />

          <Input
            label="Especialidad"
            type="text"
            value={data.specialty || ''}
            onChange={(v) => onChange('specialty', v)}
            error={errors.specialty}
            placeholder="Ej: Matemáticas, Comunicación, Ciencias"
            icon={<BookOpen className="w-4 h-4" />}
          />
        </>
      )}
    </div>
  );
}
