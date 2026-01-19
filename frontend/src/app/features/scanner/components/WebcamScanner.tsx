'use client';

import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { useWebcamScanner } from '../hooks/useWebcamScanner';
import { ScanResult } from './shared/ScanResult';

interface WebcamScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

export function WebcamScanner({ scanType, onBack }: WebcamScannerProps) {
  const { videoRef, isScanning, isInitializing, result, error, isProcessing } =
    useWebcamScanner(scanType);

  return (
    <div className="
      -mx-4 -mb-4 -mt-4 
      sm:-mx-6 sm:-mb-6 sm:-mt-6 
      lg:-ml-10 lg:-mr-10 lg:-mb-14 lg:-mt-6
      h-[calc(100vh-0px)] lg:h-screen
      flex flex-col overflow-hidden bg-black relative rounded-none lg:rounded-l-3xl
    ">
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-full w-12 h-12 flex items-center justify-center shadow-2xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md hover:scale-110 active:scale-95 transition-all border border-white/10"
        >
          <ArrowLeft size={24} className="text-text-primary dark:text-text-primary-dark" />
        </button>

        <div className="px-5 py-2.5 rounded-xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md shadow-2xl border border-white/10">
          <p className="text-xs font-black text-text-primary dark:text-text-primary-dark uppercase tracking-[0.2em]">
            {scanType === 'entry' ? 'Entrada' : 'Salida'}
          </p>
        </div>
      </div>

      <div className="flex-1 relative bg-black overflow-hidden">
        {isInitializing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Sincronizando lente</p>
          </div>
        ) : error && !isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 z-10">
            <Camera className="w-12 h-12 text-danger/50 mb-4" />
            <h3 className="text-sm font-black uppercase mb-2 tracking-tighter">Cámara no disponible</h3>
            <p className="text-xs opacity-50 mb-8 text-center max-w-xs">{error}</p>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            playsInline
            muted
            autoPlay
          />
        )}
      </div>

      <ScanResult result={result} error={error && isScanning ? error : null} />
    </div>
  );
}