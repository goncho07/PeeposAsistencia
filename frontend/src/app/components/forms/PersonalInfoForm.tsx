import React from 'react';
import { User as UserIcon, Hash, Calendar, Phone, Mail, GraduationCap } from 'lucide-react';
import FormField from './FormField';
import FormSelect from './FormSelect';
import FormSection from './FormSection';
import {
  DOCUMENT_TYPES,
  GENDER_OPTIONS,
  ENROLLMENT_STATUS
} from '@/app/config/formFieldsConfig';

interface PersonalInfoFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'edit';
  currentValues?: any;
  entityType: 'student' | 'parent' | 'teacher';
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  onChange,
  errors = {},
  mode = 'create',
  currentValues,
  entityType,
}) => {
  const isEditMode = mode === 'edit';

  return (
    <FormSection title="Información Personal" icon={<UserIcon size={18} />}>
      {/* Código de estudiante (solo para estudiantes) */}
      {entityType === 'student' && (
        <FormField
          label="Código de Estudiante"
          name="student_code"
          type="text"
          value={formData.student_code || ''}
          onChange={(e) => onChange('student_code', e.target.value)}
          placeholder="Ej: EST001"
          required
          icon={<Hash size={16} />}
          error={errors.student_code}
          currentValue={currentValues?.student_code}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Nombres */}
      <FormField
        label="Nombres"
        name="name"
        type="text"
        value={formData.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder={`Nombres del ${entityType === 'student' ? 'estudiante' : entityType === 'parent' ? 'apoderado' : 'docente'}`}
        required
        icon={<UserIcon size={16} />}
        error={errors.name}
        currentValue={currentValues?.name}
        showCurrentValue={isEditMode}
      />

      {/* Apellido Paterno */}
      <FormField
        label="Apellido Paterno"
        name="paternal_surname"
        type="text"
        value={formData.paternal_surname || ''}
        onChange={(e) => onChange('paternal_surname', e.target.value)}
        placeholder="Apellido paterno"
        required
        icon={<UserIcon size={16} />}
        error={errors.paternal_surname}
        currentValue={currentValues?.paternal_surname}
        showCurrentValue={isEditMode}
      />

      {/* Apellido Materno */}
      <FormField
        label="Apellido Materno"
        name="maternal_surname"
        type="text"
        value={formData.maternal_surname || ''}
        onChange={(e) => onChange('maternal_surname', e.target.value)}
        placeholder="Apellido materno"
        required
        icon={<UserIcon size={16} />}
        error={errors.maternal_surname}
        currentValue={currentValues?.maternal_surname}
        showCurrentValue={isEditMode}
      />

      {/* Tipo de Documento */}
      <FormSelect
        label="Tipo de Documento"
        name="document_type"
        value={formData.document_type || ''}
        onChange={(e) => onChange('document_type', e.target.value)}
        options={DOCUMENT_TYPES}
        required
        icon={<Hash size={16} />}
        error={errors.document_type}
        currentValue={currentValues?.document_type}
        showCurrentValue={isEditMode}
      />

      {/* Número de Documento */}
      <FormField
        label="Número de Documento"
        name="document_number"
        type="text"
        value={formData.document_number || ''}
        onChange={(e) => onChange('document_number', e.target.value)}
        placeholder="Número de documento"
        required
        icon={<Hash size={16} />}
        error={errors.document_number}
        currentValue={currentValues?.document_number}
        showCurrentValue={isEditMode}
      />

      {/* Género (solo para estudiantes) */}
      {entityType === 'student' && (
        <FormSelect
          label="Género"
          name="gender"
          value={formData.gender || ''}
          onChange={(e) => onChange('gender', e.target.value)}
          options={GENDER_OPTIONS}
          required
          icon={<UserIcon size={16} />}
          error={errors.gender}
          currentValue={currentValues?.gender === 'M' ? 'Masculino' : currentValues?.gender === 'F' ? 'Femenino' : ''}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Fecha de Nacimiento (solo para estudiantes) */}
      {entityType === 'student' && (
        <FormField
          label="Fecha de Nacimiento"
          name="birth_date"
          type="date"
          value={formData.birth_date || ''}
          onChange={(e) => onChange('birth_date', e.target.value)}
          required
          icon={<Calendar size={16} />}
          error={errors.birth_date}
          currentValue={currentValues?.birth_date}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Estado de Matrícula (solo para estudiantes) */}
      {entityType === 'student' && (
        <FormSelect
          label="Estado de Matrícula"
          name="enrollment_status"
          value={formData.enrollment_status || 'MATRICULADO'}
          onChange={(e) => onChange('enrollment_status', e.target.value)}
          options={ENROLLMENT_STATUS}
          required
          icon={<GraduationCap size={16} />}
          error={errors.enrollment_status}
          currentValue={currentValues?.enrollment_status}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Teléfono (para padres y docentes) */}
      {(entityType === 'parent' || entityType === 'teacher') && (
        <FormField
          label="Teléfono"
          name="phone_number"
          type="tel"
          value={formData.phone_number || ''}
          onChange={(e) => onChange('phone_number', e.target.value)}
          placeholder="999999999"
          required
          icon={<Phone size={16} />}
          error={errors.phone_number}
          currentValue={currentValues?.phone_number}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Email (para padres y docentes) */}
      {(entityType === 'parent' || entityType === 'teacher') && (
        <FormField
          label="Correo Electrónico"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="correo@ejemplo.com"
          required={false}
          icon={<Mail size={16} />}
          error={errors.email}
          currentValue={currentValues?.email}
          showCurrentValue={isEditMode}
        />
      )}

      {/* Especialización (solo para docentes) */}
      {entityType === 'teacher' && (
        <FormField
          label="Especialización"
          name="specialization"
          type="text"
          value={formData.specialization || ''}
          onChange={(e) => onChange('specialization', e.target.value)}
          placeholder="Ej: Matemáticas"
          required={false}
          icon={<GraduationCap size={16} />}
          error={errors.specialization}
          currentValue={currentValues?.specialization}
          showCurrentValue={isEditMode}
        />
      )}
    </FormSection>
  );
};

export default PersonalInfoForm;
