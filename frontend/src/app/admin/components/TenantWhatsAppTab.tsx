'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  superadminService,
  WahaLevelStatus,
  WahaStatus,
} from '@/lib/api/superadmin';
import { Button, Input } from '@/app/components/ui/base';
import {
  RefreshCw,
  Send,
  QrCode,
  Wifi,
  WifiOff,
  AlertCircle,
  Check,
  X,
  Save,
  Smartphone,
  School,
} from 'lucide-react';

interface TenantWhatsAppTabProps {
  tenantId: number;
}

const LEVEL_CONFIG: Record<string, { label: string; accent: string; accentBg: string; accentBorder: string }> = {
  inicial: { label: 'Inicial', accent: 'text-blue-500', accentBg: 'bg-blue-500/10', accentBorder: 'border-blue-500/20' },
  primaria: { label: 'Primaria', accent: 'text-emerald-500', accentBg: 'bg-emerald-500/10', accentBorder: 'border-emerald-500/20' },
  secundaria: { label: 'Secundaria', accent: 'text-violet-500', accentBg: 'bg-violet-500/10', accentBorder: 'border-violet-500/20' },
};

const STATUS_CONFIG: Record<
  WahaStatus,
  { label: string; color: string; textColor: string; icon: typeof Wifi }
> = {
  CONNECTED: {
    label: 'Conectado',
    color: 'bg-success/10',
    textColor: 'text-success',
    icon: Wifi,
  },
  QR: {
    label: 'Esperando QR',
    color: 'bg-warning/10',
    textColor: 'text-warning',
    icon: QrCode,
  },
  DISCONNECTED: {
    label: 'Desconectado',
    color: 'bg-danger/10',
    textColor: 'text-danger',
    icon: WifiOff,
  },
  ERROR: {
    label: 'Error',
    color: 'bg-danger/10',
    textColor: 'text-danger',
    icon: AlertCircle,
  },
  NO_PORT: {
    label: 'Sin puerto',
    color: 'bg-text-tertiary/10',
    textColor: 'text-text-tertiary',
    icon: WifiOff,
  },
};

export function TenantWhatsAppTab({ tenantId }: TenantWhatsAppTabProps) {
  const [statuses, setStatuses] = useState<WahaLevelStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await superadminService.getWhatsAppStatus(tenantId);
      setStatuses(data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar el estado de WhatsApp' });
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  if (loading && statuses.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 bg-background flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-card animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-24 bg-card animate-pulse rounded" />
                <div className="h-4 w-20 bg-card animate-pulse rounded" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-28 bg-card animate-pulse rounded" />
              <div className="h-11 w-full bg-card animate-pulse rounded-lg" />
              <div className="h-10 w-full bg-card animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-lg font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          <span className="flex items-center gap-2">
            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {message.text}
          </span>
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statuses.map((levelStatus) => (
          <LevelCard
            key={levelStatus.level}
            levelStatus={levelStatus}
            tenantId={tenantId}
            onMessage={showMessage}
            onRefresh={loadStatus}
          />
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={loadStatus}
          loading={loading}
          icon={<RefreshCw size={18} />}
          className="text-xl"
        >
          Actualizar estado
        </Button>
      </div>
    </div>
  );
}

interface LevelCardProps {
  levelStatus: WahaLevelStatus;
  tenantId: number;
  onMessage: (type: 'success' | 'error', text: string) => void;
  onRefresh: () => void;
}

function LevelCard({ levelStatus, tenantId, onMessage, onRefresh }: LevelCardProps) {
  const { level, port, status, phone } = levelStatus;
  const config = LEVEL_CONFIG[level] || { label: level, accent: 'text-primary', accentBg: 'bg-primary/10', accentBorder: 'border-primary/20' };
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const [editPort, setEditPort] = useState(String(port ?? ''));
  const [savingPort, setSavingPort] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showTestInput, setShowTestInput] = useState(false);

  const handleSavePort = async () => {
    const portNum = parseInt(editPort);
    if (!portNum || portNum < 1000 || portNum > 65535) {
      onMessage('error', 'Puerto inválido (1000-65535)');
      return;
    }

    try {
      setSavingPort(true);
      await superadminService.updateWhatsAppPort(tenantId, level, portNum);
      onMessage('success', `Puerto de ${config.label} actualizado`);
      onRefresh();
    } catch {
      onMessage('error', 'Error al actualizar el puerto');
    } finally {
      setSavingPort(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || testPhone.length < 9) {
      onMessage('error', 'Ingresa un número válido');
      return;
    }

    try {
      setSendingTest(true);
      await superadminService.sendWhatsAppTest(tenantId, level, testPhone);
      onMessage('success', `Mensaje de prueba enviado (${config.label})`);
      setTestPhone('');
      setShowTestInput(false);
    } catch {
      onMessage('error', 'Error al enviar mensaje. Verifica que la sesión esté conectada.');
    } finally {
      setSendingTest(false);
    }
  };

  const handleShowQR = async () => {
    if (showQR) {
      setShowQR(false);
      return;
    }

    try {
      setLoadingQR(true);
      setShowQR(true);
      const qr = await superadminService.getWhatsAppQR(tenantId, level);
      setQrImage(qr);
    } catch {
      onMessage('error', 'No se pudo obtener el QR. Verifica que la instancia esté corriendo.');
      setShowQR(false);
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <div className={`bg-surface border ${config.accentBorder} rounded-xl overflow-hidden`}>
      <div className="px-4 py-3.5 bg-background flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-lg ${config.accentBg} flex items-center justify-center`}>
            <School size={20} className={config.accent} />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">{config.label}</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-medium ${statusConfig.color} ${statusConfig.textColor}`}
        >
          <StatusIcon size={14} />
          {statusConfig.label}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {status === 'CONNECTED' && phone && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
            <Smartphone size={18} className="text-success" />
            <span className="text-base font-medium text-text-primary">+{phone}</span>
          </div>
        )}

        <div>
          <label className="text-lg font-medium text-text-secondary mb-1.5 block">Puerto WAHA</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="3001"
              value={editPort}
              onChange={(val) => setEditPort(val)}
              min={1000}
              max={65535}
            />
            <Button
              variant="ghost"
              onClick={handleSavePort}
              loading={savingPort}
              icon={<Save size={20} />}
              className="text-lg shrink-0"
            >
              Guardar
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {(status === 'QR' || status === 'DISCONNECTED') && port && (
            <Button
              variant="ghost"
              onClick={handleShowQR}
              loading={loadingQR}
              icon={<QrCode size={20} />}
              className="flex-1 text-lg"
            >
              {showQR ? 'Ocultar QR' : 'Ver QR'}
            </Button>
          )}

          {status === 'CONNECTED' && (
            <Button
              variant="ghost"
              onClick={() => setShowTestInput(!showTestInput)}
              icon={<Send size={18} />}
              className="flex-1 text-lg"
            >
              {showTestInput ? 'Cancelar' : 'Enviar Test'}
            </Button>
          )}
        </div>

        {showQR && (
          <div className="border border-border rounded-xl p-4 flex items-center justify-center bg-white min-h-[200px]">
            {loadingQR ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : qrImage ? (
              <img src={qrImage} alt="WhatsApp QR" className="max-w-full h-auto" />
            ) : (
              <p className="text-base text-text-tertiary">No se pudo cargar el QR</p>
            )}
          </div>
        )}

        {showTestInput && (
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="999 999 999"
              value={testPhone}
              onChange={setTestPhone}
            />
            <Button
              variant="primary"
              onClick={handleSendTest}
              loading={sendingTest}
              icon={<Send size={20} />}
              className="w-full text-lg"
            >
              Enviar mensaje de prueba
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
