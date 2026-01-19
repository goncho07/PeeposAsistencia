import React from 'react';
import { Input, Select } from '@/app/components/ui/base';

interface PersonalInfoFormProps {
  data: {
    full_name?: string;
    name?: string;
    paternal_surname?: string;
    maternal_surname?: string;
    document_type?: string;
    document_number?: string;
    birth_date?: string;
    gender?: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  userType: 'student' | 'teacher' | 'parent' | 'user';
  mode?: 'create' | 'edit';
}

export function PersonalInfoForm({
  data,
  onChange,
  errors = {},
  mode = 'create',
}: PersonalInfoFormProps) {
  const showFullName = mode === 'edit' || !data.name;

  return (
    <div className="space-y-4">
      {showFullName ? (
        <Input
          label="Nombre Completo"
          type="text"
          value={data.full_name || ''}
          onChange={(v) => onChange('full_name', v)}
          error={errors.full_name}
          placeholder="Ingrese el nombre completo"
          required
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nombres"
            type="text"
            value={data.name || ''}
            onChange={(v) => onChange('name', v)}
            error={errors.name}
            placeholder="Ingrese los nombres"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Apellido Paterno"
              type="text"
              value={data.paternal_surname || ''}
              onChange={(v) => onChange('paternal_surname', v)}
              error={errors.paternal_surname}
              placeholder="Apellido paterno"
              required
            />
            <Input
              label="Apellido Materno"
              type="text"
              value={data.maternal_surname || ''}
              onChange={(v) => onChange('maternal_surname', v)}
              error={errors.maternal_surname}
              placeholder="Apellido materno"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo de Documento"
          options={[
            { value: 'DNI', label: 'DNI' },
            { value: 'CE', label: 'Carnet de Extranjería' },
            { value: 'PAS', label: 'Pasaporte' },
            { value: 'CI', label: 'Cédula de Identidad' },
            { value: 'PTP', label: 'PTP' },
          ]}
          value={data.document_type || 'DNI'}
          onChange={(v) => onChange('document_type', v as string)}
          error={errors.document_type}
          required
        />

        <Input
          label="Número de Documento"
          type="text"
          value={data.document_number || ''}
          onChange={(v) => onChange('document_number', v)}
          error={errors.document_number}
          placeholder="Ingrese el número"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de Nacimiento"
          type="date"
          value={data.birth_date || ''}
          onChange={(v) => onChange('birth_date', v)}
          error={errors.birth_date}
          required
        />

        <Select
          label="Género"
          options={[
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' }
          ]}
          value={data.gender || 'M'}
          onChange={(v) => onChange('gender', v as string)}
          error={errors.gender}
          required
        />
      </div>
    </div>
  );
}
