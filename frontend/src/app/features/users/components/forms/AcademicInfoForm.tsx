import React from 'react';
import { Input, Select } from '@/app/components/ui/base';
import { Classroom } from '../../hooks/useFetchClassrooms';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface AcademicInfoFormProps {
  data: {
    classroom_id?: number;
    enrollment_date?: string;
    student_code?: string;
    academic_year?: string;
    enrollment_status?: string;
    level?: string;
    area?: string;
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
  const currentYear = new Date().getFullYear();

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

          <Input
            label="Fecha de Matrícula"
            type="date"
            value={data.enrollment_date || ''}
            onChange={(v) => onChange('enrollment_date', v)}
            error={errors.enrollment_date}
            icon={<Calendar className="w-4 h-4" />}
          />

          <Select
            label="Año Académico"
            options={[
              { value: String(currentYear - 1), label: String(currentYear - 1) },
              { value: String(currentYear), label: String(currentYear) },
              { value: String(currentYear + 1), label: String(currentYear + 1) },
            ]}
            value={data.academic_year || String(currentYear)}
            onChange={(v) => onChange('academic_year', v as string)}
            error={errors.academic_year}
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
            label="Área de Especialización"
            type="text"
            value={data.area || ''}
            onChange={(v) => onChange('area', v)}
            error={errors.area}
            placeholder="Ej: Matemáticas, Comunicación, Ciencias"
            icon={<BookOpen className="w-4 h-4" />}
          />
        </>
      )}
    </div>
  );
}
