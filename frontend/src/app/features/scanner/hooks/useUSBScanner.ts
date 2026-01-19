import { useEffect, useState, useRef, useCallback } from 'react';
import { scannerService, ScanResponse } from '@/lib/api/scanner';

const SCANNER_VENDOR_IDS = [0x05e0, 0x0765, 0x0a5f, 0x0581, 0x04b8, 0x04a9];

export function useUSBScanner(scanType: 'entry' | 'exit') {
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isScannerConnected, setIsScannerConnected] = useState<boolean>(false);

  const inputBufferRef = useRef('');
  const lastProcessedRef = useRef('');
  const scanStartTimeRef = useRef<number>(0);

  const checkScannerConnection = useCallback(async () => {
    if (!('usb' in navigator)) return;
    try {
      const devices = await navigator.usb.getDevices();
      setIsScannerConnected(devices.length > 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleScan = async (qrCode: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      const response =
        scanType === 'entry'
          ? await scannerService.scanEntry(qrCode)
          : await scannerService.scanExit(qrCode);

      setResult(response);
      setScanCount((prev) => prev + 1);

      setTimeout(() => {
        setResult(null);
        lastProcessedRef.current = '';
        setIsProcessing(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de verificación');
      setIsProcessing(false);
      setTimeout(() => {
        setError(null);
        lastProcessedRef.current = '';
      }, 2500);
    }
  };

  const requestUSBDevice = async () => {
    try {
      await navigator.usb.requestDevice({
        filters: SCANNER_VENDOR_IDS.map((v) => ({ vendorId: v })),
      });
      checkScannerConnection();
    } catch (err) {
      console.error('Error requesting USB device:', err);
    }
  };

  useEffect(() => {
    checkScannerConnection();
    if ('usb' in navigator) {
      navigator.usb.addEventListener('connect', checkScannerConnection);
      navigator.usb.addEventListener('disconnect', checkScannerConnection);
      return () => {
        navigator.usb.removeEventListener('connect', checkScannerConnection);
        navigator.usb.removeEventListener('disconnect', checkScannerConnection);
      };
    }
  }, [checkScannerConnection]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const now = Date.now();
      if (!scanStartTimeRef.current) scanStartTimeRef.current = now;
      if (isProcessing) return;

      if (event.key === 'Enter') {
        const code = inputBufferRef.current.trim();
        const scanDuration = now - scanStartTimeRef.current;

        if (code && code !== lastProcessedRef.current && scanDuration < 200) {
          lastProcessedRef.current = code;
          handleScan(code);
        } else if (scanDuration >= 200 && code) {
          setError('Entrada manual no permitida');
          setTimeout(() => setError(null), 2000);
        }
        inputBufferRef.current = '';
        scanStartTimeRef.current = 0;
        return;
      }

      if (event.key.length === 1) inputBufferRef.current += event.key;
      setTimeout(() => {
        if (Date.now() - scanStartTimeRef.current > 200) {
          inputBufferRef.current = '';
          scanStartTimeRef.current = 0;
        }
      }, 250);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isProcessing]);

  return {
    result,
    error,
    isProcessing,
    scanCount,
    isScannerConnected,
    requestUSBDevice,
  };
}
