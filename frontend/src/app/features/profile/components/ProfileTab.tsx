'use client';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { authService, UpdateProfilePayload } from '@/lib/api/auth';
import { Input, Button } from '@/app/components/ui/base';
import { Pencil, X, Save, Mail, Phone, BadgeCheck, Clock, Shield, Hash } from 'lucide-react';
import { getStorageUrl } from '@/lib/axios';

export function ProfileTab() {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState(user?.first_name || '');
  const [paternalSurname, setPaternalSurname] = useState(user?.paternal_surname || '');
  const [maternalSurname, setMaternalSurname] = useState(user?.maternal_surname || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  if (!user) return null;

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role: string) => {
    const map: Record<string, string> = {
      SUPERADMIN: 'Super Admin',
      DIRECTOR: 'Director',
      SUBDIRECTOR: 'Subdirector',
      SECRETARIO: 'Secretario',
      COORDINADOR: 'Coordinador',
      AUXILIAR: 'Auxiliar',
      DOCENTE: 'Docente',
      ESCANER: 'Escáner',
    };
    return map[role] || role;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Nunca';
    try {
      return new Date(dateStr).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const startEditing = () => {
    setName(user.first_name || '');
    setPaternalSurname(user.paternal_surname || '');
    setMaternalSurname(user.maternal_surname || '');
    setPhoneNumber(user.phone_number || '');
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: UpdateProfilePayload = {};
      if (name !== (user.first_name || '')) payload.name = name;
      if (paternalSurname !== (user.paternal_surname || '')) payload.paternal_surname = paternalSurname;
      if (maternalSurname !== (user.maternal_surname || '')) payload.maternal_surname = maternalSurname;
      if (phoneNumber !== (user.phone_number || '')) payload.phone_number = phoneNumber;

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      await authService.updateProfile(payload);
      await refreshUser();
      setIsEditing(false);
      setSuccess('Perfil actualizado exitosamente');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = user.photo_url ? getStorageUrl(user.photo_url) : null;

  return (
    <div className="space-y-6">
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium border bg-success/10 text-success border-success/20">
          {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl text-xl font-medium border bg-danger/10 text-danger border-danger/20">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <span className="text-4xl font-black text-primary">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {user.name}
            </h2>
            <p className="text-base text-text-secondary mt-0.5">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                <Shield size={24} />
                {formatRole(user.role)}
              </span>
              {user.tenant && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-secondary/10 text-secondary border border-secondary/20">
                  {user.tenant.name}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {!isEditing ? (
              <Button variant="outline" size="sm" icon={<Pencil size={16} />} onClick={startEditing} className="text-xl">
                Editar
              </Button>
            ) : (
              <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={cancelEditing} className="text-xl">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Editar información
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={name}
              onChange={setName}
              placeholder="Tu nombre"
              required
            />
            <Input
              label="Apellido Paterno"
              value={paternalSurname}
              onChange={setPaternalSurname}
              placeholder="Apellido paterno"
              required
            />
            <Input
              label="Apellido Materno"
              value={maternalSurname}
              onChange={setMaternalSurname}
              placeholder="Apellido materno"
            />
            <Input
              label="Teléfono"
              type="tel"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="+51 999 999 999"
              icon={<Phone size={18} />}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={cancelEditing} disabled={saving} className="text-xl">
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={<Save size={18} />}
              onClick={handleSave}
              loading={saving}
              className="text-xl"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-text-primary mb-6">
            Información personal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
            <InfoField icon={Mail} label="Correo" value={user.email} />
            <InfoField icon={Phone} label="Teléfono" value={user.phone_number || 'No registrado'} />
            <InfoField icon={Hash} label="Documento" value={
              user.document_number
                ? `${user.document_type || 'DNI'}: ${user.document_number}`
                : 'No registrado'
            } />
            <InfoField icon={BadgeCheck} label="Estado" value={user.status === 'ACTIVO' ? 'Activo' : user.status || 'N/A'} />
            <InfoField icon={Clock} label="Último acceso" value={formatDate(user.last_login_at)} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center mt-0.5">
        <Icon size={24} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-text-primary mt-0.5 break-all">
          {value}
        </p>
      </div>
    </div>
  );
}
