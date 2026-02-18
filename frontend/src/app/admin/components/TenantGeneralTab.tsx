'use client';
import { useState } from 'react';
import { superadminService, Tenant, TenantFormData } from '@/lib/api/superadmin';
import { Input, Button, Select } from '@/app/components/ui/base';
import {
  Save,
  X,
  Building2,
  MapPin,
  Palette,
  ImageIcon,
} from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

interface TenantGeneralTabProps {
  tenant: Tenant;
  onUpdate: (tenant: Tenant) => void;
}

export function TenantGeneralTab({ tenant, onUpdate }: TenantGeneralTabProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    modular_code: tenant.modular_code || '',
    name: tenant.name,
    ruc: tenant.ruc || '',
    director_name: tenant.director_name || '',
    founded_year: tenant.founded_year || undefined,
    institution_type: tenant.institution_type || undefined,
    level: tenant.level || undefined,
    email: tenant.email || '',
    phone: tenant.phone || '',
    address: tenant.address || '',
    department: tenant.department || '',
    province: tenant.province || '',
    district: tenant.district || '',
    ugel: tenant.ugel || '',
    ubigeo: tenant.ubigeo || '',
    timezone: tenant.timezone || 'America/Lima',
    primary_color: tenant.primary_color || '#3B82F6',
    is_active: tenant.is_active,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['info']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleChange = (field: keyof TenantFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const result = await superadminService.updateTenant(tenant.id, formData);
      onUpdate(result.tenant);
      setMessage({ type: 'success', text: 'Cambios guardados correctamente' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar cambios',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner' | 'background', file: File) => {
    setUploadingImage(type);
    try {
      const result = await superadminService.uploadTenantImage(tenant.id, type, file);
      onUpdate({
        ...tenant,
        [`${type}_url`]: result.url,
      });
      setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} actualizado` });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al subir imagen',
      });
    } finally {
      setUploadingImage(null);
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

  const imageCount = [tenant.logo_url, tenant.banner_url, tenant.background_url].filter(Boolean).length;

  const infoSummary = [formData.name, formData.institution_type, formData.level]
    .filter(Boolean)
    .join(' · ');

  const locationSummary = [formData.district, formData.province, formData.department]
    .filter(Boolean)
    .join(', ');

  const customSummary = [
    formData.timezone,
    formData.primary_color,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <CollapsibleSection
        icon={ImageIcon}
        title="Imágenes"
        summary={`${imageCount} de 3 imágenes subidas`}
        isOpen={openSections.has('images')}
        onToggle={() => toggleSection('images')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImageUploader
            label="Logo"
            currentUrl={tenant.logo_url}
            uploading={uploadingImage === 'logo'}
            onUpload={(file) => handleImageUpload('logo', file)}
          />
          <ImageUploader
            label="Banner"
            currentUrl={tenant.banner_url}
            uploading={uploadingImage === 'banner'}
            onUpload={(file) => handleImageUpload('banner', file)}
          />
          <ImageUploader
            label="Fondo"
            currentUrl={tenant.background_url}
            uploading={uploadingImage === 'background'}
            onUpload={(file) => handleImageUpload('background', file)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Building2}
        title="Información Básica"
        summary={infoSummary}
        isOpen={openSections.has('info')}
        onToggle={() => toggleSection('info')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Nombre de la institución"
            value={formData.name}
            onChange={(v) => handleChange('name', v)}
            required
          />
          <Input
            label="Código modular"
            value={formData.modular_code || ''}
            onChange={(v) => handleChange('modular_code', v)}
          />
          <Input
            label="RUC"
            value={formData.ruc || ''}
            onChange={(v) => handleChange('ruc', v)}
          />
          <Input
            label="Director"
            value={formData.director_name || ''}
            onChange={(v) => handleChange('director_name', v)}
          />
          <Input
            label="Año de fundación"
            type="number"
            value={formData.founded_year?.toString() || ''}
            onChange={(v) => handleChange('founded_year', v ? parseInt(v) : undefined)}
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
          />
          <Input
            label="Teléfono"
            value={formData.phone || ''}
            onChange={(v) => handleChange('phone', v)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={MapPin}
        title="Ubicación"
        summary={locationSummary}
        isOpen={openSections.has('location')}
        onToggle={() => toggleSection('location')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Dirección"
            value={formData.address || ''}
            onChange={(v) => handleChange('address', v)}
          />
          <Input
            label="Departamento"
            value={formData.department || ''}
            onChange={(v) => handleChange('department', v)}
          />
          <Input
            label="Provincia"
            value={formData.province || ''}
            onChange={(v) => handleChange('province', v)}
          />
          <Input
            label="Distrito"
            value={formData.district || ''}
            onChange={(v) => handleChange('district', v)}
          />
          <Input
            label="UGEL"
            value={formData.ugel || ''}
            onChange={(v) => handleChange('ugel', v)}
          />
          <Input
            label="Ubigeo"
            value={formData.ubigeo || ''}
            onChange={(v) => handleChange('ubigeo', v)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Palette}
        title="Personalización"
        summary={customSummary}
        isOpen={openSections.has('custom')}
        onToggle={() => toggleSection('custom')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xl font-medium text-text-primary mb-2">
              Color primario
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primary_color || '#3B82F6'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-10 h-10 border border-border cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color || '#3B82F6'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-text-primary text-xl"
              />
            </div>
          </div>
          <Input
            label="Zona horaria"
            value={formData.timezone || 'America/Lima'}
            onChange={(v) => handleChange('timezone', v)}
          />
        </div>
      </CollapsibleSection>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          variant="primary"
          icon={<Save size={18} />}
          loading={saving}
          onClick={handleSave}
          className="text-xl"
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

function ImageUploader({
  label,
  currentUrl,
  uploading,
  onUpload,
}: {
  label: string;
  currentUrl: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <label className="block text-xl font-medium text-text-primary mb-2">
        {label}
      </label>
      <div className="relative border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-24 object-contain rounded"
          />
        ) : (
          <div className="h-24 flex items-center justify-center text-text-tertiary">
            Sin imagen
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="mt-4 text-md text-text-secondary">
          {uploading ? (
            <span className="text-primary">Subiendo...</span>
          ) : (
            'Click para cambiar'
          )}
        </div>
      </div>
    </div>
  );
}
