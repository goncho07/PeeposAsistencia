'use client';

import { ArrowLeft, Scan, ShieldCheck, Loader2 } from 'lucide-react';
import { useUSBScanner } from '../hooks/useUSBScanner';
import { ScanResult } from './shared/ScanResult';

interface USBScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

export function USBScanner({ scanType, onBack }: USBScannerProps) {
  const { result, error, isProcessing, scanCount, isScannerConnected, requestUSBDevice } =
    useUSBScanner(scanType);

  return (
    <div className="
      -mx-4 -mb-4 -mt-4
      sm:-mx-6 sm:-mb-6 sm:-mt-6
      lg:-ml-10 lg:-mr-10 lg:-mb-14 lg:-mt-6
      h-[calc(100vh-0px)] lg:h-screen
      flex flex-col overflow-hidden bg-black relative rounded-none lg:rounded-l-3xl
    ">
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-full w-12 h-12 flex items-center justify-center shadow-2xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md hover:scale-110 active:scale-95 transition-all border border-white/10"
          >
            <ArrowLeft size={24} className="text-text-primary dark:text-text-primary-dark" />
          </button>

          <div className="px-5 py-2.5 rounded-xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md shadow-2xl border border-white/10">
            <p className="text-xs font-black text-text-primary dark:text-text-primary-dark uppercase tracking-[0.2em]">
              Lector USB • {scanType === 'entry' ? 'Entrada' : 'Salida'}
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-primary text-white shadow-2xl flex items-center gap-3">
          <span className="text-[10px] font-black uppercase opacity-70">Sesión</span>
          <span className="text-lg font-black leading-none">{scanCount}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              {isProcessing && (
                <div className="absolute -inset-8 border-2 border-primary/30 rounded-full animate-ping" />
              )}
              <div className={`
                w-48 h-48 rounded-[40px] flex items-center justify-center border-4 transition-all duration-500
                ${isProcessing
                  ? 'bg-primary/10 border-primary scale-110 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]'
                  : 'bg-white/5 border-white/10 scale-100'
                }
              `}>
                {isProcessing ? (
                  <Loader2 size={64} className="text-primary animate-spin" />
                ) : (
                  <Scan size={64} className="text-white opacity-20" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                {isProcessing ? 'Procesando...' : 'Esperando QR'}
              </h2>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                Use el lector láser de mano
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-4">
        {!isScannerConnected && (
          <button
            onClick={requestUSBDevice}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <ShieldCheck size={20} />
            Vincular Lector USB
          </button>
        )}

        <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <div className={`w-3 h-3 rounded-full ${isScannerConnected ? 'bg-success animate-pulse shadow-[0_0_12px_#10b981]' : 'bg-white/20'
            }`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            Hardware: {isScannerConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <ScanResult result={result} error={error} scanType={scanType} />
    </div>
  );
}
