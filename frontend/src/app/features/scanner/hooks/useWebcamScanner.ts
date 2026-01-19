import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { scannerService, ScanResponse } from '@/lib/api/scanner';

export function useWebcamScanner(scanType: 'entry' | 'exit') {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (code: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const response =
        scanType === 'entry'
          ? await scannerService.scanEntry(code)
          : await scannerService.scanExit(code);

      setResult(response);

      setTimeout(() => {
        setResult(null);
        setIsProcessing(false);
        lastScannedRef.current = '';
      }, 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el escaneo');
      setIsProcessing(false);
      lastScannedRef.current = '';

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const startScanning = async () => {
    if (isInitializingRef.current) return;

    try {
      setIsInitializing(true);
      isInitializingRef.current = true;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const videoElement = videoRef.current;
      if (videoElement) {
        if (videoElement.srcObject) {
          const oldStream = videoElement.srcObject as MediaStream;
          oldStream.getTracks().forEach((track) => track.stop());
        }
        videoElement.srcObject = null;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

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

      const selectedDeviceId =
        videoInputDevices.find(
          (device) =>
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
    try {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.error('Error resetting code reader:', e);
        }
        codeReaderRef.current = null;
      }

      const videoElement = videoRef.current;
      if (videoElement) {
        try {
          videoElement.pause();
          videoElement.currentTime = 0;
        } catch (e) {
          console.error('Error pausing video:', e);
        }

        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
        videoElement.srcObject = null;
      }

      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsScanning(false);
    } catch (e) {
      console.error('Error stopping scanner:', e);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    const handleBeforeUnload = () => {
      stopScanning();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    startScanning();

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.error('Error resetting code reader:', e);
        }
        codeReaderRef.current = null;
      }

      const videoElement = videoRef.current;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoElement.srcObject = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsScanning(false);
      setIsInitializing(false);
    };
  }, []);

  return {
    videoRef,
    isScanning,
    isInitializing,
    result,
    error,
    isProcessing,
  };
}
