'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { scannerService, ScanResponse } from '@/lib/api/scanner';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '@/lib/axios';

interface WebcamScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

export function WebcamScanner({ scanType, onBack }: WebcamScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const initScanner = async () => {
      if (isInitializingRef.current) {
        return;
      }
      await startScanning();
    };

    // Listener para detectar cuando el usuario sale de la página
    const handleBeforeUnload = () => {
      console.log('WebcamScanner: beforeunload event - Stopping camera');
      stopScanning();
    };

    // Listener para detectar visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('WebcamScanner: Page hidden - Pausing camera');
        // Opcionalmente puedes pausar aquí
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    initScanner();

    return () => {
      console.log('WebcamScanner: Component unmounting, cleaning up camera...');
      isMountedRef.current = false;

      // Remover event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Limpieza inmediata y agresiva
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
          console.log('WebcamScanner: Code reader reset');
        } catch (e) {
          console.error('WebcamScanner: Error resetting code reader:', e);
        }
        codeReaderRef.current = null;
      }

      // Detener todos los tracks del video
      const videoElement = videoRef.current;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const tracks = stream.getTracks();
        console.log(`WebcamScanner: Cleanup - Stopping ${tracks.length} video track(s)`);
        tracks.forEach((track, idx) => {
          const label = track.label;
          const stateBefore = track.readyState;
          track.stop();
          console.log(`WebcamScanner: Cleanup - Track ${idx + 1} stopped: "${label}" (${stateBefore} -> ${track.readyState})`);
        });
        videoElement.srcObject = null;
        console.log('WebcamScanner: Video srcObject cleared');
      }

      // Detener tracks del stream guardado
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        console.log(`WebcamScanner: Cleanup - Stopping ${tracks.length} stream track(s)`);
        tracks.forEach((track, idx) => {
          const label = track.label;
          const stateBefore = track.readyState;
          track.stop();
          console.log(`WebcamScanner: Cleanup - Stream track ${idx + 1} stopped: "${label}" (${stateBefore} -> ${track.readyState})`);
        });
        streamRef.current = null;
        console.log('WebcamScanner: Stream reference cleared');
      }

      setIsScanning(false);
      setIsInitializing(false);
      console.log('WebcamScanner: Cleanup complete');
    };
  }, []);

  const startScanning = async () => {
    if (isInitializingRef.current) {
      return;
    }

    try {
      setIsInitializing(true);
      isInitializingRef.current = true;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const videoElement = videoRef.current;
      if (videoElement) {
        try {
          videoElement.pause();
          videoElement.currentTime = 0;
          videoElement.load();
        } catch (e) {
          //
        }

        if (videoElement.srcObject) {
          const oldStream = videoElement.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        videoElement.srcObject = null;

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await new Promise(resolve => setTimeout(resolve, 400));

      if (!isMountedRef.current) {
        isInitializingRef.current = false;
        return;
      }

      setIsScanning(true);
      setError(null);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setError('No se encontró ninguna cámara');
        isInitializingRef.current = false;
        return;
      }

      const selectedDeviceId = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0].deviceId;

      const hints = new Map();
      hints.set(2, true);

      codeReader.hints = hints;
      codeReader.timeBetweenDecodingAttempts = 100;

      if (!isMountedRef.current) {
        isInitializingRef.current = false;
        return;
      }

      if (videoRef.current) {
        videoRef.current.load();
      }

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, error) => {
          if (!isMountedRef.current) return;

          if (result) {
            const scannedCode = result.getText();

            if (scannedCode !== lastScannedRef.current && !isProcessing) {
              lastScannedRef.current = scannedCode;
              await handleScan(scannedCode);
            }
          }
        }
      );

      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }

      setIsInitializing(false);
      isInitializingRef.current = false;
    } catch (err: any) {
      setIsInitializing(false);
      isInitializingRef.current = false;
      if (isMountedRef.current) {
        setError('Error al acceder a la cámara: ' + err.message);
        setIsScanning(false);
      }
    }
  };

  const stopScanning = () => {
    console.log('WebcamScanner: stopScanning() called');
    try {
      // Detener el code reader primero
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
          console.log('WebcamScanner: Code reader reset successfully');
        } catch (e) {
          console.error('WebcamScanner: Error resetting code reader:', e);
        }
        codeReaderRef.current = null;
      }

      // Detener y limpiar el video element
      const videoElement = videoRef.current;
      if (videoElement) {
        try {
          videoElement.pause();
          videoElement.currentTime = 0;
          console.log('WebcamScanner: Video paused');
        } catch (e) {
          console.error('WebcamScanner: Error pausing video:', e);
        }

        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          const tracks = stream.getTracks();
          console.log(`WebcamScanner: Stopping ${tracks.length} track(s) from video element`);

          tracks.forEach((track, index) => {
            const label = track.label;
            const state = track.readyState;
            track.stop();
            console.log(`WebcamScanner: Track ${index + 1}/${tracks.length} stopped - Label: "${label}", State before: ${state}, State after: ${track.readyState}`);
          });

          videoElement.srcObject = null;
          console.log('WebcamScanner: Video srcObject set to null');
        }
      }

      // Detener tracks del stream reference
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        console.log(`WebcamScanner: Stopping ${tracks.length} track(s) from stream reference`);

        tracks.forEach((track, index) => {
          const label = track.label;
          const state = track.readyState;
          track.stop();
          console.log(`WebcamScanner: Stream track ${index + 1}/${tracks.length} stopped - Label: "${label}", State before: ${state}, State after: ${track.readyState}`);
        });

        streamRef.current = null;
        console.log('WebcamScanner: Stream reference set to null');
      }

      setIsScanning(false);
      console.log('WebcamScanner: stopScanning() completed successfully');
    } catch (err) {
      console.error('WebcamScanner: Critical error in stopScanning():', err);
    }
  };

  const handleScan = async (qrCode: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const response = scanType === 'entry'
        ? await scannerService.scanEntry(qrCode)
        : await scannerService.scanExit(qrCode);

      setResult(response);

      setTimeout(() => {
        setResult(null);
        lastScannedRef.current = '';
        setIsProcessing(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el escaneo');
      setIsProcessing(false);

      setTimeout(() => {
        setError(null);
        lastScannedRef.current = '';
      }, 1500);
    }
  };

  const handleSafeExit = async () => {
    console.log('WebcamScanner: handleSafeExit() called - Beginning safe exit sequence');
    setIsInitializing(true);

    // Esperar un frame para que el UI se actualice
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Detener el escáner
    stopScanning();

    // Esperar un poco más para asegurar que todos los recursos se liberaron
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('WebcamScanner: Safe exit sequence complete, navigating back');
    onBack();
  };

  return (
    <div className="absolute inset-0 bg-black">
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black">
          <Loader2 className="w-16 h-16 mb-4 animate-spin text-white" />
          <p className="text-white text-lg font-medium">Inicializando cámara...</p>
          <p className="text-white/70 text-sm mt-2">Por favor, permite el acceso</p>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full bg-black"
        style={{
          objectFit: 'contain',
          opacity: isInitializing ? 0 : 1,
          transition: 'opacity 0.3s'
        }}
        playsInline
        muted
      />

      <motion.button
        onClick={handleSafeExit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isInitializing}
        className="absolute top-6 left-10 rounded-full w-12 h-12 flex items-center justify-center shadow-md z-10 transition-all disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <ArrowLeft size={24} style={{ color: 'var(--color-text-primary)' }} />
      </motion.button>

      <div className="absolute top-4 right-4 z-10">
        {isScanning && !isProcessing && (
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">Listo para escanear</span>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          <p className="text-white font-bold text-lg">
            {scanType === 'entry' ? '🟢 ENTRADA' : '🔴 SALIDA'}
          </p>
        </div>
      </div>

      {!result && !error && !isProcessing && (
        <div className="absolute bottom-8 left-0 right-0 text-center z-10 px-4">
          <p className="text-white text-base md:text-lg font-medium bg-black/70 py-3 px-6 inline-block rounded-full backdrop-blur-sm shadow-lg">
            Asegurese de no tener la camara abierta en otras aplicaciones
          </p>
        </div>
      )}

      <AnimatePresence>
        {(result || error || isProcessing) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[95%] max-w-xl"
            >
              <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                {isProcessing && !result && !error && (
                  <div className="p-10 text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Procesando...</p>
                  </div>
                )}

                {result && (
                  <div className="relative">
                    <div
                      className="h-3"
                      style={{
                        backgroundColor: result.attendance.entry_status === 'ASISTIO' || result.attendance.exit_status === 'COMPLETO'
                          ? '#22c55e'
                          : result.attendance.entry_status === 'TARDANZA'
                          ? '#eab308'
                          : '#f97316'
                      }}
                    ></div>

                    <div className="p-8">
                      <div className="flex items-start gap-6 mb-6">
                        {result.person.photo_url ? (
                          <img
                            src={getStorageUrl(result.person.photo_url)}
                            alt={result.person.full_name}
                            className="w-28 h-28 rounded-full object-cover border-4 shrink-0"
                            style={{ borderColor: 'var(--color-primary)' }}
                          />
                        ) : (
                          <div
                            className="w-28 h-28 rounded-full flex items-center justify-center border-4 shrink-0"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                              borderColor: 'var(--color-primary)'
                            }}
                          >
                            <CheckCircle2 className="w-14 h-14" style={{ color: 'var(--color-primary)' }} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-3xl font-black mb-2 truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {result.person.full_name}
                          </h3>
                          <p className="text-lg font-bold mb-1" style={{ color: '#22c55e' }}>
                            {result.message}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-card)' }}>
                          <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--color-secondary)' }}>⏰ Hora</p>
                          <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                            {result.attendance.entry_time || result.attendance.exit_time
                              ? new Date(result.attendance.entry_time || result.attendance.exit_time || '').toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </p>
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-card)' }}>
                          <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--color-secondary)' }}>📊 Estado</p>
                          <p className="text-xl font-black truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {result.attendance.entry_status || result.attendance.exit_status || '-'}
                          </p>
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-card)' }}>
                          <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--color-secondary)' }}>🌅 Turno</p>
                          <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>{result.attendance.shift}</p>
                        </div>

                        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-card)' }}>
                          <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--color-secondary)' }}>📱 Notificación</p>
                          <p className="text-xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                            {result.attendance.whatsapp_sent ? '✅ Enviada' : '⏳ Pendiente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="relative">
                    <div className="h-3" style={{ backgroundColor: '#ef4444' }}></div>
                    <div className="p-10 text-center">
                      <XCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#ef4444' }} />
                      <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
