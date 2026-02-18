'use client';
import { useState } from 'react';
import { superadminService, Tenant } from '@/lib/api/superadmin';
import { Button, Input } from '@/app/components/ui/base';
import { AlertTriangle, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface TenantDangerTabProps {
  tenant: Tenant;
  onDelete: () => void;
}

export function TenantDangerTab({ tenant, onDelete }: TenantDangerTabProps) {
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isActive, setIsActive] = useState(tenant.is_active);
  const [error, setError] = useState('');

  const canDelete =
    tenant.counts.users === 0 &&
    tenant.counts.students === 0 &&
    tenant.counts.teachers === 0;

  const handleToggleActive = async () => {
    setToggling(true);
    setError('');
    try {
      const result = await superadminService.toggleTenantActive(tenant.id);
      setIsActive(result.is_active);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (confirmName !== tenant.name) {
      setError('El nombre no coincide');
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await superadminService.deleteTenant(tenant.id);
      onDelete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar tenant');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-medium text-text-primary">Estado del Tenant</h3>
            <p className="text-base text-text-secondary mt-1">
              {isActive
                ? 'El tenant está activo y los usuarios pueden acceder normalmente.'
                : 'El tenant está desactivado. Los usuarios no pueden iniciar sesión.'}
            </p>
          </div>
          <button
            onClick={handleToggleActive}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-medium transition-colors ${
              isActive
                ? 'bg-success/10 text-success hover:bg-success/20'
                : 'bg-text-tertiary/10 text-text-tertiary hover:bg-text-tertiary/20'
            }`}
          >
            {toggling ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isActive ? (
              <ToggleRight size={20} />
            ) : (
              <ToggleLeft size={20} />
            )}
            {isActive ? 'Activo' : 'Inactivo'}
          </button>
        </div>
      </div>

      <div className="border border-danger/30 rounded-lg p-4 bg-danger/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-danger shrink-0 mt-0.5" size={30} />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-danger">Eliminar Tenant</h3>
            <p className="text-base text-text-secondary mt-1">
              Esta acción es <strong>irreversible</strong>. Se eliminarán todos los datos
              asociados al tenant, incluyendo configuraciones, aulas y registros.
            </p>

            {!canDelete && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-lg text-warning font-medium">
                  No se puede eliminar este tenant
                </p>
                <p className="text-base text-text-secondary mt-1">
                  Tiene datos asociados que deben eliminarse primero:
                </p>
                <ul className="text-base text-text-secondary mt-2 space-y-1">
                  {tenant.counts.users > 0 && (
                    <li>• {tenant.counts.users} usuarios</li>
                  )}
                  {tenant.counts.students > 0 && (
                    <li>• {tenant.counts.students} estudiantes</li>
                  )}
                  {tenant.counts.teachers > 0 && (
                    <li>• {tenant.counts.teachers} docentes</li>
                  )}
                </ul>
              </div>
            )}

            {canDelete && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Escribe <strong>{tenant.name}</strong> para confirmar:
                  </label>
                  <Input
                    value={confirmName}
                    onChange={setConfirmName}
                    placeholder={tenant.name}
                  />
                </div>

                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}

                <Button
                  variant="danger"
                  icon={<Trash2 size={18} />}
                  onClick={handleDelete}
                  loading={deleting}
                  disabled={confirmName !== tenant.name}
                  className="w-full"
                >
                  Eliminar Tenant Permanentemente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
