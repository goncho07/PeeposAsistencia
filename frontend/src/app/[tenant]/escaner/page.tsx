'use client';

import { useState } from 'react';
import { Camera, Scan, UserSearch, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { WebcamScanner } from '@/app/components/scanner/WebcamScanner';
import { USBScanner } from '@/app/components/scanner/USBScanner';
import { ManualScanner } from '@/app/components/scanner/ManualScanner';

type ScannerMode = 'webcam' | 'usb' | 'manual' | null;
type ScanType = 'entry' | 'exit' | null;

const getModeLabel = (mode: ScannerMode): string => {
  switch (mode) {
    case 'webcam':
      return 'CÁMARA WEBCAM';
    case 'usb':
      return 'PISTOLA USB';
    case 'manual':
      return 'BÚSQUEDA MANUAL';
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

  const isFullscreen = selectedMode && scanType;

  return (
    <DashboardLayout>
      <div className={isFullscreen ? "scanner-fullscreen" : ""}>
      {!selectedMode ? (
        <>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Módulo de Escaneo
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Seleccione el método de entrada de datos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('webcam')}
              className="card p-6 md:p-8 text-center cursor-pointer transition-all"
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <Camera size={48} className="md:w-16 md:h-16" style={{ color: 'var(--color-primary)' }} />
                </div>
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Cámara Webcam
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Escaneo visual inteligente
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('usb')}
              className="card p-6 md:p-8 text-center cursor-pointer transition-all"
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <Scan size={48} className="md:w-16 md:h-16" style={{ color: 'var(--color-primary)' }} />
                </div>
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Pistola USB
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Lector HID físico (Plug & Play)
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModeSelect('manual')}
              className="card p-6 md:p-8 text-center cursor-pointer transition-all"
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <UserSearch size={48} className="md:w-16 md:h-16" style={{ color: 'var(--color-primary)' }} />
                </div>
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Búsqueda Manual
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Buscar por nombre, DNI o código
              </p>
            </motion.button>
          </div>
        </>
      ) : !scanType ? (
        <>
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full w-12 h-12 flex items-center justify-center shadow-md mb-6 transition-all"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <ArrowLeft
              size={24}
              style={{ color: 'var(--color-text-primary)' }}
            />
          </motion.button>

          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 rounded-lg mb-4"
                 style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
              <p className="text-sm md:text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                {getModeLabel(selectedMode)}
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Tipo de Registro
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Seleccione si es entrada o salida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScanTypeSelect('entry')}
              className="card p-8 md:p-12 text-center cursor-pointer transition-all border-2"
              style={{
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgb(34, 197, 94)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <LogIn size={48} className="md:w-16 md:h-16 text-green-600" />
                </div>
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-green-600">
                ENTRADA
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Registrar ingreso al plantel
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScanTypeSelect('exit')}
              className="card p-8 md:p-12 text-center cursor-pointer transition-all border-2"
              style={{
                borderColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgb(249, 115, 22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                  <LogOut size={48} className="md:w-16 md:h-16 text-orange-600" />
                </div>
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-orange-600">
                SALIDA
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Registrar salida del plantel
              </p>
            </motion.button>
          </div>
        </>
      ) : (
        <>
          {selectedMode === 'webcam' && <WebcamScanner key={`webcam-${scanType}`} scanType={scanType} onBack={handleBack} />}
          {selectedMode === 'usb' && <USBScanner key={`usb-${scanType}`} scanType={scanType} onBack={handleBack} />}
          {selectedMode === 'manual' && <ManualScanner key={`manual-${scanType}`} scanType={scanType} onBack={handleBack} />}
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
