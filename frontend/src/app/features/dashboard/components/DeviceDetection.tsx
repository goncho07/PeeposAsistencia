'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/app/components/ui/base';
import { Camera, Usb, RefreshCw, ShieldCheck } from 'lucide-react';

interface Device {
  type: 'camera' | 'scanner';
  name: string;
  status: 'connected' | 'disconnected';
}

const SCANNER_VENDOR_IDS = [0x05e0, 0x0765, 0x0a5f, 0x0581, 0x04b8, 0x04a9];

export function DeviceDetection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUsbPermission, setHasUsbPermission] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const detectCameras = async (): Promise<Device[]> => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter((device) => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        return [
          {
            type: 'camera',
            name: 'No detectada',
            status: 'disconnected',
          },
        ];
      }

      return videoDevices.map((device, index) => ({
        type: 'camera',
        name: device.label || `Cámara ${index + 1}`,
        status: 'connected' as const,
      }));
    } catch (error) {
      console.error('Error detecting cameras:', error);
      return [
        {
          type: 'camera',
          name: 'Error al detectar',
          status: 'disconnected',
        },
      ];
    }
  };

  const detectScanners = async (): Promise<Device[]> => {
    if (!('usb' in navigator)) {
      return [
        {
          type: 'scanner',
          name: 'WebUSB no soportado',
          status: 'disconnected',
        },
      ];
    }

    try {
      const usbDevices = await navigator.usb.getDevices();

      if (usbDevices.length === 0) {
        return [
          {
            type: 'scanner',
            name: hasUsbPermission ? 'No detectado' : 'Sin autorización',
            status: 'disconnected',
          },
        ];
      }

      setHasUsbPermission(true);
      return usbDevices.map((scanner, index) => ({
        type: 'scanner',
        name: scanner.productName || `Scanner ${index + 1}`,
        status: 'connected' as const,
      }));
    } catch (error) {
      console.error('Error detecting scanners:', error);
      return [
        {
          type: 'scanner',
          name: 'No detectado',
          status: 'disconnected',
        },
      ];
    }
  };

  const detectDevices = useCallback(async () => {
    setIsRefreshing(true);

    const [cameras, scanners] = await Promise.all([detectCameras(), detectScanners()]);

    setDevices([...cameras, ...scanners]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [hasUsbPermission]);

  const requestUsbPermission = async () => {
    if (!('usb' in navigator)) return;

    try {
      await navigator.usb.requestDevice({
        filters: SCANNER_VENDOR_IDS.map((vendorId) => ({ vendorId })),
      });
      setHasUsbPermission(true);
      detectDevices();
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        console.log('No se seleccionó ningún dispositivo USB');
      } else {
        console.error('Error requesting USB permission:', error);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    detectDevices();

    const handleDeviceChange = () => detectDevices();
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    const handleUsbConnect = () => detectDevices();
    const handleUsbDisconnect = () => detectDevices();

    if ('usb' in navigator) {
      navigator.usb.addEventListener('connect', handleUsbConnect);
      navigator.usb.addEventListener('disconnect', handleUsbDisconnect);
    }

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      if ('usb' in navigator) {
        navigator.usb.removeEventListener('connect', handleUsbConnect);
        navigator.usb.removeEventListener('disconnect', handleUsbDisconnect);
      }
    };
  }, [detectDevices]);

  return (
    <Card padding="lg" className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Dispositivos Conectados
        </h3>
        <div className="flex items-center gap-2">
          {isMounted && !hasUsbPermission && typeof window !== 'undefined' && 'usb' in navigator && (
            <Button size="sm" variant="outline" onClick={requestUsbPermission} icon={<ShieldCheck className="w-4 h-4" />}>
              Autorizar
            </Button>
          )}
          <button
            onClick={detectDevices}
            disabled={isRefreshing}
            className={`
              p-2 rounded-lg transition-colors
              bg-surface dark:bg-surface-dark
              hover:bg-primary/10 dark:hover:bg-primary/20
              text-text-secondary dark:text-text-secondary-dark
              disabled:opacity-50
              ${isRefreshing ? 'animate-spin' : ''}
            `}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-background dark:bg-background-dark transition-transform hover:translate-x-1"
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                  ${
                    device.status === 'connected'
                      ? 'bg-success/10 dark:bg-success/20 text-success dark:text-success-light'
                      : 'bg-danger/10 dark:bg-danger/20 text-danger dark:text-danger-light'
                  }
                `}
              >
                {device.type === 'camera' ? <Camera className="w-5 h-5" /> : <Usb className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate text-text-primary dark:text-text-primary-dark">
                    {device.name}
                  </p>
                  <span
                    className={`
                      shrink-0 w-2 h-2 rounded-full
                      ${device.status === 'connected' ? 'bg-success' : 'bg-danger'}
                    `}
                  />
                </div>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  {device.type === 'camera' ? 'Cámara' : 'Scanner USB'} •{' '}
                  {device.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {devices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              Detectando dispositivos...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
