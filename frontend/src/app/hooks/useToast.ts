import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '@/app/components/ui/Toast';

let toastIdCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((
        type: ToastType,
        title: string,
        message?: string,
        duration?: number
    ) => {
        const id = `toast-${++toastIdCounter}`;
        const newToast: ToastMessage = {
            id,
            type,
            title,
            message,
            duration,
        };

        setToasts((prev) => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number) => {
        return showToast('success', title, message, duration);
    }, [showToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        return showToast('error', title, message, duration);
    }, [showToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        return showToast('warning', title, message, duration);
    }, [showToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        return showToast('info', title, message, duration);
    }, [showToast]);

    return {
        toasts,
        success,
        error,
        warning,
        info,
        removeToast,
    };
}
