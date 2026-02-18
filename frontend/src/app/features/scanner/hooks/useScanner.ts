import { useState } from 'react';
import { scannerService, ScanResponse, DeviceType } from '@/lib/api/scanner';

export function useScanner(scanType: 'entry' | 'exit', deviceType: DeviceType) {
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scan = async (qrCode: string, onSuccess?: () => void) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const response =
        scanType === 'entry'
          ? await scannerService.scanEntry(qrCode, deviceType)
          : await scannerService.scanExit(qrCode, deviceType);

      setResult(response);

      setTimeout(() => {
        setResult(null);
        setIsProcessing(false);
        if (onSuccess) onSuccess();
      }, 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al procesar el registro'
      );
      setIsProcessing(false);

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return {
    result,
    error,
    isProcessing,
    scan,
  };
}
