import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const bgColor = {
        success: 'bg-green-100 dark:bg-green-900/30',
        error: 'bg-red-100 dark:bg-red-900/30',
        info: 'bg-blue-100 dark:bg-blue-900/30',
    };

    const textColor = {
        success: 'text-green-800 dark:text-green-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-blue-800 dark:text-blue-200',
    };

    const icon = {
        success: <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />,
        error: <XCircle className="text-red-600 dark:text-red-400" size={24} />,
        info: <Info className="text-blue-600 dark:text-blue-400" size={24} />,
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-4 right-4 z-50 max-w-md"
                >
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border bg-white dark:bg-slate-800`}>
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor[type]}`}>
                            {icon[type]}
                        </div>
                        <p className={`flex-1 font-semibold ${textColor[type]}`}>
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={18} className="text-gray-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
