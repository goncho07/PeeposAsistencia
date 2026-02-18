'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { superadminService, TenantFormData } from '@/lib/api/superadmin';
import { Input, Button, Select } from '@/app/components/ui/base';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function NewTenantPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    code: '',
    ruc: '',
    institution_type: undefined,
    level: undefined,
    email: '',
    phone: '',
    address: '',
    department: 'LIMA',
    province: 'LIMA',
    district: '',
    ugel: '',
    timezone: 'America/Lima',
    primary_color: '#3B82F6',
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof TenantFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const result = await superadminService.createTenant(formData);
      router.push(`/admin/tenants/${result.tenant.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el tenant');
      setSaving(false);
    }
  };

  const institutionTypes = [
    { value: '', label: 'Seleccionar...' },
    { value: 'ESTATAL', label: 'Estatal' },
    { value: 'PRIVADA', label: 'Privada' },
    { value: 'CONVENIO', label: 'Convenio' },
  ];

  const levels = [
    { value: '', label: 'Seleccionar...' },
    { value: 'INICIAL', label: 'Inicial' },
    { value: 'PRIMARIA', label: 'Primaria' },
    { value: 'SECUNDARIA', label: 'Secundaria' },
    { value: 'MULTIPLE', label: 'Múltiple' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/tenants"
          className="p-2 rounded-lg hover:bg-background text-text-secondary"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Nuevo Tenant</h1>
            <p className="text-sm text-text-secondary">
              Registra una nueva institución en el sistema
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium border bg-danger/10 text-danger border-danger/20">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nombre de la institución"
                value={formData.name}
                onChange={(v) => handleChange('name', v)}
                placeholder="I.E.E. Nombre del Colegio"
                required
              />
            </div>
            <Input
              label="Código modular"
              value={formData.code || ''}
              onChange={(v) => handleChange('code', v)}
              placeholder="0325464"
            />
            <Input
              label="RUC"
              value={formData.ruc || ''}
              onChange={(v) => handleChange('ruc', v)}
              placeholder="20506159360"
            />
            <Select
              label="Tipo de institución"
              value={formData.institution_type || ''}
              onChange={(v) => handleChange('institution_type', v || undefined)}
              options={institutionTypes}
            />
            <Select
              label="Nivel educativo"
              value={formData.level || ''}
              onChange={(v) => handleChange('level', v || undefined)}
              options={levels}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(v) => handleChange('email', v)}
              placeholder="contacto@colegio.edu.pe"
            />
            <Input
              label="Teléfono"
              value={formData.phone || ''}
              onChange={(v) => handleChange('phone', v)}
              placeholder="01-1234567"
            />
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Dirección"
                value={formData.address || ''}
                onChange={(v) => handleChange('address', v)}
                placeholder="Av. Principal 123"
              />
            </div>
            <Input
              label="Departamento"
              value={formData.department || ''}
              onChange={(v) => handleChange('department', v)}
              placeholder="LIMA"
            />
            <Input
              label="Provincia"
              value={formData.province || ''}
              onChange={(v) => handleChange('province', v)}
              placeholder="LIMA"
            />
            <Input
              label="Distrito"
              value={formData.district || ''}
              onChange={(v) => handleChange('district', v)}
              placeholder="SURQUILLO"
            />
            <Input
              label="UGEL"
              value={formData.ugel || ''}
              onChange={(v) => handleChange('ugel', v)}
              placeholder="07"
            />
          </div>
        </section>

        {/* Customization */}
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Personalización
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Color primario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primary_color || '#3B82F6'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color || '#3B82F6'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <label htmlFor="is_active" className="text-sm text-text-primary">
                Activar tenant inmediatamente
              </label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/admin/tenants">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
            loading={saving}
          >
            Crear Tenant
          </Button>
        </div>
      </form>
    </div>
  );
}
