'use client';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AuthAlertProps {
    type?: 'error' | 'success' | 'warning';
    message: string;
}

export function AuthAlert({ type = 'error', message }: AuthAlertProps) {
    const styles =
        type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            : type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-xl border ${styles}`}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
