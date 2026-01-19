'use client';
import React from 'react';
import { Input } from '@/app/components/ui/base';
import { Mail, Phone } from 'lucide-react';

interface ContactInfoFormProps {
  data: {
    email?: string;
    phone_number?: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  userType: 'student' | 'teacher' | 'parent' | 'user';
}

export function ContactInfoForm({
  data,
  onChange,
  errors = {},
  userType,
}: ContactInfoFormProps) {
  const requireEmail = userType === 'teacher' || userType === 'user';

  return (
    <div className="space-y-4">
      <Input
        label="Correo Electrónico"
        type="email"
        value={data.email || ''}
        onChange={(v) => onChange('email', v)}
        error={errors.email}
        placeholder="ejemplo@correo.com"
        icon={<Mail className="w-4 h-4" />}
        required={requireEmail}
      />

      <Input
        label="Número de Teléfono"
        type="tel"
        value={data.phone_number || ''}
        onChange={(v) => onChange('phone_number', v)}
        error={errors.phone_number}
        placeholder="+51 999 999 999"
        icon={<Phone className="w-4 h-4" />}
        required={userType === 'parent'}
      />
    </div>
  );
}