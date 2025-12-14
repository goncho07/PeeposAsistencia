'use client';
import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' |'info';

export function useToast() {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('success');
    const [isVisible, setIsVisible] = useState(false);

    const showToast = useCallback((msg: string, toastType: ToastType = 'success') => {
        setMessage(msg);
        setType(toastType);
        setIsVisible(true);
    }, []);

    const hideToast = useCallback(() => {
        setIsVisible(false);
    }, []);

    return {
        message,
        type,
        isVisible,
        showToast,
        hideToast,
    };
}
