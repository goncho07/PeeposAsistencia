'use client';
import { ArrowRightCircle } from 'lucide-react';

interface AuthButtonProps {
    loading?: boolean;
    children: string;
}

export function AuthButton({ loading, children }: AuthButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                </>
            ) : (
                <>
                    {children} <ArrowRightCircle size={20} />
                </>
            )}
        </button>
    );
}
