'use client';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import React from 'react';

interface AlertModalProps {
    type?: 'error' | 'success' | 'warning';
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onClose: () => void;
    onConfirm?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    type = 'error',
    title,
    message,
    confirmLabel = 'Entendido',
    cancelLabel,
    onClose,
    onConfirm,
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-500" size={48} />;
            case 'warning':
                return <AlertTriangle className="text-yellow-500" size={48} />;
            default:
                return <XCircle className="text-red-500" size={48} />;
        }
    };

    const getTitle = () => {
        if (title) return title;
        if (type === 'success') return 'Éxito';
        if (type === 'warning') return 'Confirmar acción';
        return 'Error';
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'warning':
                return 'bg-yellow-500 hover:bg-yellow-600';
            default:
                return 'bg-red-600 hover:bg-red-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-slate-700 text-center"
            >
                <div className="flex flex-col items-center mb-3">
                    {getIcon()}
                    <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{getTitle()}</h3>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">{message}</p>

                <div className="mt-5 flex justify-center gap-3">
                    {cancelLabel && (
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                        >
                            {cancelLabel}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        className={`px-6 py-2 text-white font-semibold rounded-lg transition-all ${getButtonColor()}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AlertModal;