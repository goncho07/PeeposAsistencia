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
    bgClass: 'bg-gradient-to-br from-success/95 to-success-dark/90',
    borderClass: 'border-success/50',
    iconBgClass: 'bg-white/20',
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-gradient-to-br from-danger/95 to-danger-dark/90',
    borderClass: 'border-danger/50',
    iconBgClass: 'bg-white/20',
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-gradient-to-br from-warning/95 to-warning-dark/90',
    borderClass: 'border-warning/50',
    iconBgClass: 'bg-white/20',
  },
  info: {
    icon: Info,
    bgClass: 'bg-gradient-to-br from-primary/95 to-primary-dark/90',
    borderClass: 'border-primary/50',
    iconBgClass: 'bg-white/20',
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
      className={`
        pointer-events-auto relative overflow-hidden rounded-xl border shadow-xl
        min-w-[320px] max-w-[420px]
        ${config.bgClass}
        ${config.borderClass}
      `}
    >
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute top-0 left-0 h-1 bg-white/50"
      />

      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.iconBgClass}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-0.5 text-white">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-xs leading-relaxed text-white/90">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onClose(toast.id)}
            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/20 text-white/90"
            aria-label="Close notification"
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
