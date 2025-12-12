import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'date' | 'select' | 'number';
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    maxLength?: number;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    options,
    maxLength
}) => {
    const baseClasses = "w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white";

    return (
        <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {type === 'select' && options ? (
                <select
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseClasses}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={baseClasses}
                />
            )}
        </div>
    );
};

export default FormField;