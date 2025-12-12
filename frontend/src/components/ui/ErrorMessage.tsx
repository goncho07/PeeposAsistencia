import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error al cargar datos</h3>
                <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
            </div>
            <button
                onClick={onRetry}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
                Reintentar
            </button>
        </div>
    );
};

export default ErrorMessage;