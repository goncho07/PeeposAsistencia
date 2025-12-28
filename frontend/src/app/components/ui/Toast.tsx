'use client';
import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.9) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        iconColor: 'rgb(255, 255, 255)',
        iconBg: 'rgba(255, 255, 255, 0.2)',
        textColor: 'rgb(255, 255, 255)',
        textSecondary: 'rgba(255, 255, 255, 0.9)',
    },
    error: {
        icon: XCircle,
        gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        iconColor: 'rgb(255, 255, 255)',
        iconBg: 'rgba(255, 255, 255, 0.2)',
        textColor: 'rgb(255, 255, 255)',
        textSecondary: 'rgba(255, 255, 255, 0.9)',
    },
    warning: {
        icon: AlertCircle,
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.9) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        iconColor: 'rgb(255, 255, 255)',
        iconBg: 'rgba(255, 255, 255, 0.2)',
        textColor: 'rgb(255, 255, 255)',
        textSecondary: 'rgba(255, 255, 255, 0.9)',
    },
    info: {
        icon: Info,
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.9) 100%)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        iconColor: 'rgb(255, 255, 255)',
        iconBg: 'rgba(255, 255, 255, 0.2)',
        textColor: 'rgb(255, 255, 255)',
        textSecondary: 'rgba(255, 255, 255, 0.9)',
    },
};

export function Toast({ toast, onClose }: ToastProps) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const duration = toast.duration || 4000;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto relative overflow-hidden rounded-xl border shadow-xl"
            style={{
                background: config.gradient,
                borderColor: config.borderColor,
                minWidth: '320px',
                maxWidth: '420px',
            }}
        >
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="absolute top-0 left-0 h-1"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            />

            <div className="p-4 pt-5">
                <div className="flex items-start gap-3">
                    <div
                        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: config.iconBg }}
                    >
                        <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-0.5" style={{ color: config.textColor }}>
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="text-xs leading-relaxed" style={{ color: config.textSecondary }}>
                                {toast.message}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => onClose(toast.id)}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/20"
                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-9999 pointer-events-none">
            <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} onClose={onClose} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
