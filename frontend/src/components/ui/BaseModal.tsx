'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    className?: string;
    preventClose?: boolean;
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
};

export const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    size = 'md',
    children,
    className = '',
    preventClose = false,
}) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !preventClose) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, preventClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                onClick={!preventClose ? onClose : undefined}
            >
                <motion.div
                    key="content"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`w-full ${sizeMap[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700 ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
