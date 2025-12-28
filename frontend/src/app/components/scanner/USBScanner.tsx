'use client';

import { useEffect, useState, useRef } from 'react';
import { scannerService, ScanResponse } from '@/lib/api/scanner';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '@/lib/axios';

interface USBScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

export function USBScanner({ scanType, onBack }: USBScannerProps) {
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const inputBufferRef = useRef('');
  const lastProcessedRef = useRef('');
  const scanStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const now = Date.now();

      if (!scanStartTimeRef.current) {
        scanStartTimeRef.current = now;
      }

      if (isProcessing) return;

      if (event.key === 'Enter') {
        const code = inputBufferRef.current.trim();
        const scanDuration = now - scanStartTimeRef.current;

        if (code && code !== lastProcessedRef.current && scanDuration < 200) {
          lastProcessedRef.current = code;
          handleScan(code);
        } else if (scanDuration >= 200 && code) {
          setError('⚠️ Use el scanner USB, no el teclado');
          setTimeout(() => setError(null), 2000);
        }

        inputBufferRef.current = '';
        scanStartTimeRef.current = 0;
        return;
      }

      if (event.key.length > 1) {
        return;
      }

      inputBufferRef.current += event.key;

      setTimeout(() => {
        const timeSinceStart = Date.now() - scanStartTimeRef.current;
        if (timeSinceStart > 200) {
          inputBufferRef.current = '';
          scanStartTimeRef.current = 0;
        }
      }, 250);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isProcessing]);

  const handleScan = async (qrCode: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const response = scanType === 'entry'
        ? await scannerService.scanEntry(qrCode)
        : await scannerService.scanExit(qrCode);

      setResult(response);
      setScanCount(prev => prev + 1);

      setTimeout(() => {
        setResult(null);
        lastProcessedRef.current = '';
        setIsProcessing(false);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el escaneo');
      setIsProcessing(false);

      setTimeout(() => {
        setError(null);
        lastProcessedRef.current = '';
      }, 1000);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
         style={{
           background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, var(--color-background)) 0%, color-mix(in srgb, var(--color-secondary) 10%, var(--color-background)) 100%)'
         }}>

      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-10 rounded-full w-12 h-12 flex items-center justify-center shadow-md z-50 transition-all"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <ArrowLeft size={24} style={{ color: 'var(--color-text-primary)' }} />
      </motion.button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg backdrop-blur-sm"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <p className="text-white font-bold text-sm md:text-lg">
            {scanType === 'entry' ? '🟢 ENTRADA' : '🔴 SALIDA'}
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="px-3 md:px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <span className="text-white text-xs md:text-sm font-medium">
            Escaneos: <span className="font-bold text-base md:text-lg">{scanCount}</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {!result && !error && !isProcessing && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center mb-6 md:mb-8 border-4"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  borderColor: 'var(--color-primary)'
                }}
              >
                <Scan className="w-16 h-16 md:w-20 md:h-20" style={{ color: 'var(--color-primary)' }} />
              </motion.div>

              <h3 className="text-3xl md:text-5xl font-black mb-4 md:mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Listo para escanear
              </h3>

              <div className="rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-2xl border-2 max-w-xl mx-auto"
                   style={{
                     backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                     borderColor: 'var(--color-primary)'
                   }}>
                <p className="text-base md:text-xl leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                  📱 <span className="font-bold">Apunte la pistola scanner</span> hacia el código QR del carnet
                </p>
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t"
                     style={{ borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
                  <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                    El sistema procesará automáticamente la asistencia y enviará la notificación correspondiente
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isProcessing && !result && !error && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <Loader2 className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Procesando...</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="card rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
                <div className="h-3 md:h-4"
                     style={{
                       backgroundColor: result.attendance.entry_status === 'COMPLETO' || result.attendance.exit_status === 'COMPLETO'
                         ? '#22c55e'
                         : result.attendance.entry_status === 'TARDANZA'
                         ? '#eab308'
                         : '#f97316'
                     }}></div>

                <div className="p-6 md:p-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4 md:mb-6">
                    {result.person.photo_url ? (
                      <img
                        src={getStorageUrl(result.person.photo_url)}
                        alt={result.person.full_name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 shrink-0"
                        style={{ borderColor: 'var(--color-primary)' }}
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 shrink-0"
                           style={{
                             backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                             borderColor: 'var(--color-primary)'
                           }}>
                        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16" style={{ color: 'var(--color-primary)' }} />
                      </div>
                    )}

                    <div className="text-center md:text-left">
                      <h3 className="text-2xl md:text-4xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {result.person.full_name}
                      </h3>
                      <p className="text-xl md:text-2xl font-bold" style={{ color: '#22c55e' }}>
                        ✓ {result.attendance.entry_status || result.attendance.exit_status}
                      </p>
                      <p className="text-base md:text-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {result.attendance.entry_time || result.attendance.exit_time
                          ? new Date(result.attendance.entry_time || result.attendance.exit_time || '').toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="card rounded-3xl shadow-2xl overflow-hidden max-w-xl mx-auto">
                <div className="h-3 md:h-4" style={{ backgroundColor: '#ef4444' }}></div>
                <div className="p-6 md:p-10">
                  <XCircle className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6" style={{ color: '#ef4444' }} />
                  <p className="text-xl md:text-3xl font-bold" style={{ color: '#ef4444' }}>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
