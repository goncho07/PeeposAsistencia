'use client';

import { useState } from 'react';
import { Camera, Scan, UserSearch, ArrowLeft, LogIn, LogOut, ScanLine } from 'lucide-react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { ScannerModeCard } from '@/app/features/scanner/components/shared/ScannerModeCard';
import { ScanTypeCard } from '@/app/features/scanner/components/shared/ScanTypeCard';
import { ManualScanner, WebcamScanner, USBScanner } from '@/app/features/scanner/components';

type ScannerMode = 'webcam' | 'usb' | 'manual' | null;
type ScanType = 'entry' | 'exit' | null;

const getModeLabel = (mode: ScannerMode): string => {
  switch (mode) {
    case 'webcam':
      return 'Cámara Webcam';
    case 'usb':
      return 'Pistola USB';
    case 'manual':
      return 'Búsqueda Manual';
    default:
      return '';
  }
};

export default function ScannerPage() {
  const [selectedMode, setSelectedMode] = useState<ScannerMode>(null);
  const [scanType, setScanType] = useState<ScanType>(null);

  const handleModeSelect = (mode: ScannerMode) => {
    setSelectedMode(mode);
    setScanType(null);
  };

  const handleBack = () => {
    if (scanType) {
      setScanType(null);
    } else {
      setSelectedMode(null);
    }
  };

  const handleScanTypeSelect = (type: ScanType) => {
    setScanType(type);
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Escáner' }];
    if (selectedMode) {
      crumbs.push({ label: getModeLabel(selectedMode) });
    }
    if (scanType) {
      crumbs.push({ label: scanType === 'entry' ? 'Entrada' : 'Salida' });
    }
    return crumbs;
  };

  return (
    <AppLayout>
      <div className="flex flex-col flex-1">
        {!selectedMode ? (
          <>
            <HeroHeader
              title="Escáner de Asistencia"
              subtitle="Registra la entrada y salida del personal mediante diferentes métodos de escaneo."
              icon={ScanLine}
              breadcrumbs={getBreadcrumbs()}
            />

            <div className="flex-1 flex items-center justify-center py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full">
                <ScannerModeCard
                  icon={Camera}
                  title="Cámara Webcam"
                  description="Escaneo visual con cámara integrada"
                  onClick={() => handleModeSelect('webcam')}
                />
                <ScannerModeCard
                  icon={Scan}
                  title="Pistola USB"
                  description="Lector de códigos de barras HID"
                  onClick={() => handleModeSelect('usb')}
                />
                <ScannerModeCard
                  icon={UserSearch}
                  title="Búsqueda Manual"
                  description="Buscar por nombre, DNI o código"
                  onClick={() => handleModeSelect('manual')}
                />
              </div>
            </div>
          </>
        ) : !scanType ? (
          <>
            <HeroHeader
              title="Tipo de Registro"
              subtitle={`Selecciona si es entrada o salida usando ${getModeLabel(selectedMode)}.`}
              icon={ScanLine}
              breadcrumbs={getBreadcrumbs()}
            />

            <div className="mb-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark"
              >
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl w-full">
                <ScanTypeCard
                  icon={LogIn}
                  title="ENTRADA"
                  description="Registrar ingreso al plantel"
                  color="success"
                  onClick={() => handleScanTypeSelect('entry')}
                />
                <ScanTypeCard
                  icon={LogOut}
                  title="SALIDA"
                  description="Registrar salida del plantel"
                  color="warning"
                  onClick={() => handleScanTypeSelect('exit')}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {selectedMode === 'webcam' && (
              <WebcamScanner key={`webcam-${scanType}`} scanType={scanType} onBack={handleBack} />
            )}
            {selectedMode === 'usb' && (
              <USBScanner key={`usb-${scanType}`} scanType={scanType} onBack={handleBack} />
            )}
            {selectedMode === 'manual' && (
              <ManualScanner key={`manual-${scanType}`} scanType={scanType} onBack={handleBack} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
