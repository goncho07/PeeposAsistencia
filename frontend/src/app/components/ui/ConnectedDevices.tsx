'use client';
import { useState, useEffect, useCallback } from 'react';
import { Camera, Usb, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Device {
  type: 'camera' | 'scanner';
  name: string;
  status: 'connected' | 'disconnected';
}

const SCANNER_VENDOR_IDS = [
  0x05e0,
  0x0765,
  0x0a5f,
  0x0581, 
  0x04b8,
  0x04a9,
];

export function ConnectedDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUsbPermission, setHasUsbPermission] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const detectCameras = async (): Promise<Device[]> => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        return [{
          type: 'camera',
          name: 'No detectada',
          status: 'disconnected'
        }];
      }

      return videoDevices.map((device, index) => ({
        type: 'camera',
        name: device.label || `Cámara ${index + 1}`,
        status: 'connected' as const
      }));
    } catch (error) {
      console.error('Error detecting cameras:', error);
      return [{
        type: 'camera',
        name: 'Error al detectar',
        status: 'disconnected'
      }];
    }
  };

  const detectScanners = async (): Promise<Device[]> => {
    if (!('usb' in navigator)) {
      return [{
        type: 'scanner',
        name: 'WebUSB no soportado',
        status: 'disconnected'
      }];
    }

    try {
      const usbDevices = await navigator.usb.getDevices();

      if (usbDevices.length === 0) {
        return [{
          type: 'scanner',
          name: hasUsbPermission ? 'No detectado' : 'Sin autorización',
          status: 'disconnected'
        }];
      }

      setHasUsbPermission(true);
      return usbDevices.map((scanner, index) => ({
        type: 'scanner',
        name: scanner.productName || `Scanner ${index + 1}`,
        status: 'connected' as const
      }));
    } catch (error) {
      console.error('Error detecting scanners:', error);
      return [{
        type: 'scanner',
        name: 'No detectado',
        status: 'disconnected'
      }];
    }
  };

  const detectDevices = useCallback(async () => {
    setIsRefreshing(true);

    const [cameras, scanners] = await Promise.all([
      detectCameras(),
      detectScanners()
    ]);

    setDevices([...cameras, ...scanners]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [hasUsbPermission]);

  const requestUsbPermission = async () => {
    if (!('usb' in navigator)) return;

    try {
      await navigator.usb.requestDevice({
        filters: SCANNER_VENDOR_IDS.map(vendorId => ({ vendorId }))
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

  const handleRefresh = () => {
    detectDevices();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Dispositivos Conectados
        </h3>
        <div className="flex items-center">
          {isMounted && !hasUsbPermission && typeof window !== 'undefined' && 'usb' in navigator && (
            <motion.button
              onClick={requestUsbPermission}
              className="px-2 py-2 rounded-lg transition-colors text-xs font-medium flex items-center gap-2"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                color: 'var(--color-primary)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheck size={16} />
              Autorizar
            </motion.button>
          )}
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? {
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            } : { duration: 0.2 }}
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <motion.div
            key={index}
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-surface)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: device.status === 'connected'
                    ? 'color-mix(in srgb, var(--color-success) 15%, transparent)'
                    : 'color-mix(in srgb, var(--color-danger) 15%, transparent)',
                  color: device.status === 'connected'
                    ? 'var(--color-success)'
                    : 'var(--color-danger)'
                }}
              >
                {device.type === 'camera' ? (
                  <Camera size={20} />
                ) : (
                  <Usb size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {device.name}
                  </p>
                  <span
                    className="shrink-0 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: device.status === 'connected'
                        ? 'var(--color-success)'
                        : 'var(--color-danger)'
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {device.type === 'camera' ? 'Cámara' : 'Scanner USB'} • {
                    device.status === 'connected' ? 'Conectado' : 'Desconectado'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {devices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Detectando dispositivos...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
