'use client';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    icon?: LucideIcon;
}

export function AuthInput({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled,
    icon: Icon,
}: AuthInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-${Icon ? '10' : '4'} pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    required
                />
            </div>
        </div>
    );
}
