'use client';
import { useState, useEffect, useCallback } from 'react';
import { authService, SessionInfo } from '@/lib/api/auth';
import { Input, Button } from '@/app/components/ui/base';
import { Modal } from '@/app/components/ui/base/Modal';
import {
  Lock,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Trash2,
  RefreshCw,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export function SecurityTab() {
  return (
    <div className="space-y-6">
      <ChangePasswordCard />
      <ActiveSessionsCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSuccess('Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lock size={34} className="text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-text-primary">
            Cambiar contraseña
          </h3>
          <p className="text-md text-text-secondary">
            Al cambiar tu contraseña se cerrarán las demás sesiones activas
          </p>
        </div>
      </div>

      {success && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium border bg-success/10 text-success border-success/20 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl text-xl font-medium border bg-danger/10 text-danger border-danger/20 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Contraseña actual"
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="••••••••"
          icon={<Lock size={18} />}
          actionIcon={showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          onActionClick={() => setShowCurrent(!showCurrent)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nueva contraseña"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            icon={<Lock size={18} />}
            actionIcon={showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            onActionClick={() => setShowNew(!showNew)}
            required
          />
          <Input
            label="Confirmar nueva contraseña"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repite la contraseña"
            icon={<Lock size={18} />}
            actionIcon={showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            onActionClick={() => setShowConfirm(!showConfirm)}
            error={confirmPassword && newPassword !== confirmPassword ? 'No coincide' : undefined}
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            icon={<ShieldCheck size={24} />}
            loading={loading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="text-xl"
          >
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </div>
  );
}

function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch {
      setError('Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await authService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al revocar sesión');
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await authService.logoutAll();
      await loadSessions();
      setShowLogoutAll(false);
    } catch {
      setError('Error al cerrar sesiones');
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const parseUserAgent = (ua: string | null): { device: string; icon: React.ElementType } => {
    if (!ua) return { device: 'Desconocido', icon: Monitor };

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const icon = isMobile ? Smartphone : Monitor;

    let browser = 'Navegador';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    let os = '';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { device: `${browser}${os ? ` en ${os}` : ''}`, icon };
  };

  const formatDate = (dateStr: string) => {
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

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor size={34} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary">
                Sesiones activas
              </h3>
              <p className="text-md text-text-secondary">
                Dispositivos con sesión iniciada
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" icon={<RefreshCw size={22} />} onClick={loadSessions} disabled={loading} className="text-xl">
            Actualizar
          </Button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium border bg-danger/10 text-danger border-danger/20 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center py-8 text-sm text-text-secondary">
            No se encontraron sesiones activas
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const { device, icon: DeviceIcon } = parseUserAgent(session.user_agent);

              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    session.is_current
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    session.is_current ? 'bg-primary/10' : 'bg-background'
                  }`}>
                    <DeviceIcon size={24} className={session.is_current ? 'text-primary' : 'text-text-secondary'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-text-primary truncate">
                        {device}
                      </p>
                      {session.is_current && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-sm font-bold bg-success/10 text-success border border-success/20">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-md text-text-secondary mt-0.5">
                      {session.ip_address || 'IP desconocida'} &middot; {formatDate(session.last_activity)}
                    </p>
                  </div>

                  {!session.is_current && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={24} />}
                      onClick={() => handleRevoke(session.id)}
                      loading={revoking === session.id}
                      disabled={revoking !== null}
                      className="text-xl"
                    >
                      <span className="hidden sm:inline">Revocar</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {otherSessions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              icon={<LogOut size={24} />}
              onClick={() => setShowLogoutAll(true)}
              className="text-xl text-danger border-danger/30 hover:bg-danger/10"
            >
              Cerrar todas las demás sesiones
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showLogoutAll}
        onClose={() => setShowLogoutAll(false)}
        title="Cerrar todas las sesiones"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowLogoutAll(false)} disabled={logoutAllLoading} className="text-xl">
              Cancelar
            </Button>
            <Button variant="danger" icon={<LogOut size={18} />} onClick={handleLogoutAll} loading={logoutAllLoading} className="text-xl">
              Cerrar sesiones
            </Button>
          </>
        }
      >
        <p className="text-lg text-text-secondary">
          Se cerrarán <strong>{otherSessions.length}</strong> sesión(es) en otros dispositivos.
          Tu sesión actual no se verá afectada.
        </p>
      </Modal>
    </>
  );
}
