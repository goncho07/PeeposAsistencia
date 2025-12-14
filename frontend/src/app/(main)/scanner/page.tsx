'use client';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    RefreshCcw,
    LogIn,
    LogOut,
    GraduationCap,
    Briefcase,
    Shield,
} from 'lucide-react'

type ScanMode = 'entry' | 'exit' | null;

interface AttendanceData {
    id: number;
    date: string;
    entry_time: string | null;
    exit_time: string | null;
    entry_status: string | null;
    exit_status: string | null;
    whatsapp_sent: boolean;
    whatsapp_sent_at?: string | null;
}

interface Person {
    id: number;
    name: string;
    paternal_surname: string;
    maternal_surname: string;
    document_number: string;
    document_type: string;
    gender: string;
    date_of_birth: string;
}

interface ScanResponse {
    success: boolean;
    message: string;
    person?: Person;
    attendance?: AttendanceData;
}

export default function ScannerPage() {
    const [scanMode, setScanMode] = useState<ScanMode>(null);
    const [loading, setLoading] = useState(false);
    const [scannedUser, setScannedUser] = useState<any>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isProcessingRef = useRef(false);

    let controls: any = null;

    useEffect(() => {
        if (!scanMode) {
            stopScanner();
            return;
        }

        let cancelled = false;
        setCameraError(null);
        setLoading(true);

        const reader = new BrowserQRCodeReader();

        reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, error, ctrl) => {
            if (cancelled) return;
            if (ctrl) controls = ctrl;
            if (result) handleScan(result.getText());
        })
            .catch(err => {
                console.error('Camera error:', err);
                setCameraError('No se pudo acceder a la cámara.');
            })
            .finally(() => setLoading(false));

        return () => {
            cancelled = true;
            stopScanner();
        };
    }, [scanMode]);

    const stopScanner = () => {
        if (controls) {
            controls.stop();
            controls = null;
        }
    };

    const handleScan = async (qrCode: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        console.log('%c[SCAN DETECTED]', 'color: cyan; font-weight: bold;');
        console.log('QR CODE VALUE:', qrCode);

        setLoading(true);
        try {
            const route = scanMode === 'entry' ? '/scanner/entry' : '/scanner/exit';
            console.log('Sending POST to:', route, { qr_code: qrCode });

            const response = await api.post<ScanResponse>(route, { qr_code: qrCode });
            const data = response.data;
            console.log('%c[SCAN SUCCESS]', 'color: lime; font-weight: bold;', data);

            if (data.success && data.person) {
                const p = data.person;
                const attendance = data.attendance;

                let message = 'Asistencia';

                if (scanMode === 'entry') {
                    message = attendance?.entry_status || 'Ingreso registrado';
                }

                if (scanMode === 'exit') {
                    message = attendance?.exit_status || 'Salida registrada';
                }

                if (attendance && attendance.whatsapp_sent === false) {
                    message += ' · Sin apoderado (no se notificó)';
                }

                setScannedUser({
                    name: `${p.name} ${p.paternal_surname} ${p.maternal_surname}`,
                    role: 'Estudiante',
                    detail: message,
                    document_number: p.document_number,
                    success: true,
                    actionText: scanMode === 'entry' ? 'Entrada Registrada' : 'Salida Registrada',
                });
            } else {
                setScannedUser({
                    name: 'Desconocido',
                    role: 'Visitante',
                    detail: data.message || 'Código no reconocido',
                    success: false,
                    actionText: 'Acceso Denegado',
                });
            }
        } catch (err: any) {
            console.error('%c[SCAN ERROR]', 'color: red; font-weight: bold;', err);

            const msg =
                err.response?.data?.message ||
                'Ocurrió un error al registrar la asistencia.';

            setScannedUser({
                name: 'Error de Registro',
                role: 'Sistema',
                detail: msg,
                success: false,
                actionText: 'Error',
            });
        } finally {
            setLoading(false);
            setTimeout(() => {
                setScannedUser(null);
                isProcessingRef.current = false;
            }, 4000);
        }
    };

    const retryCamera = () => {
        const current = scanMode;
        setScanMode(null);
        setTimeout(() => setScanMode(current), 100);
    };

    const handleManualClose = () => setScannedUser(null);

    if (!scanMode) {
        return (
            <div className="w-full h-full bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setScanMode('entry')}
                        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-4xl shadow-xl border-b-8 border-green-500 hover:shadow-2xl transition-all group"
                    >
                        <div className="w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-8 group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                            <LogIn size={64} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">ENTRADA</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Registrar Ingreso</p>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setScanMode('exit')}
                        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-4xl shadow-xl border-b-8 border-orange-500 hover:shadow-2xl transition-all group"
                    >
                        <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-8 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/30 transition-colors">
                            <LogOut size={64} className="text-orange-600 dark:text-orange-400 pl-2" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">SALIDA</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Registrar Salida</p>
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col rounded-3xl shadow-2xl">
            <div className="absolute top-6 left-6 z-30">
                <button
                    onClick={() => setScanMode(null)}
                    className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors border border-white/10"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="absolute top-6 right-6 z-30">
                <div
                    className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-md border border-white/10 ${scanMode === 'entry' ? 'bg-green-500/80 text-white' : 'bg-orange-500/80 text-white'
                        }`}
                >
                    {scanMode === 'entry' ? 'MODO ENTRADA' : 'MODO SALIDA'}
                </div>
            </div>

            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />

            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-white text-sm font-medium animate-pulse">Inicializando cámara...</p>
                </div>
            )}

            {cameraError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                    <div className="bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-700">
                        <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
                        <p className="text-gray-400 mb-6 text-sm">{cameraError}</p>
                        <button
                            onClick={retryCamera}
                            className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCcw size={18} /> Reintentar
                        </button>
                    </div>
                </div>
            )}

            {!cameraError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                        {['tl', 'tr', 'bl', 'br'].map((pos) => (
                            <div
                                key={pos}
                                className={`absolute w-12 h-12 border-[6px] ${scanMode === 'entry' ? 'border-green-500' : 'border-orange-500'
                                    } ${pos === 'tl'
                                        ? 'top-0 left-0 rounded-tl-3xl border-t border-l'
                                        : pos === 'tr'
                                            ? 'top-0 right-0 rounded-tr-3xl border-t border-r'
                                            : pos === 'bl'
                                                ? 'bottom-0 left-0 rounded-bl-3xl border-b border-l'
                                                : 'bottom-0 right-0 rounded-br-3xl border-b border-r'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 flex justify-center">
                        <div className="px-6 py-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-sm font-medium tracking-wide">
                            Escanee el código QR del carnet
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {scannedUser && (
                    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl overflow-hidden shadow-2xl relative"
                        >
                            <div
                                className={`h-32 flex items-center justify-center relative overflow-hidden ${scannedUser.success ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                                    {scannedUser.success ? (
                                        <CheckCircle2 size={48} className="text-green-600" />
                                    ) : (
                                        <XCircle size={48} className="text-red-600" />
                                    )}
                                </div>
                                <button
                                    onClick={handleManualClose}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 text-center -mt-4 relative z-10 bg-white dark:bg-slate-900 rounded-t-4xl">
                                <span
                                    className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${scannedUser.success
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {scannedUser.actionText}
                                </span>

                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                    {scannedUser.name || 'Desconocido'}
                                </h2>

                                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
                                    {scannedUser.role === 'Estudiante' && <GraduationCap size={18} />}
                                    {scannedUser.role === 'Docente' && <Briefcase size={18} />}
                                    {scannedUser.role === 'Administrativo' && <Shield size={18} />}
                                    <span className="font-medium text-lg">{scannedUser.role}</span>
                                </div>

                                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                                    <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-slate-700">
                                        <div className="text-center px-2">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Detalle</p>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">
                                                {scannedUser.detail}
                                            </p>
                                        </div>
                                        <div className="text-center px-2">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Hora</p>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">
                                                {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 text-xs text-gray-400 font-mono">
                                    ID: {scannedUser.document_number || 'N/A'}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
