'use client';
import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-text-primary dark:text-text-primary-dark">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        <select
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            const numVal = Number(val);
            onChange(isNaN(numVal) || val === "" ? val : numVal);
          }}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-xl
            border border-border dark:border-border-dark
            bg-background dark:bg-surface-dark
            text-text-primary dark:text-text-primary-dark
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-sm
            ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-danger animate-fade-in">{error}</p>
      )}
    </div>
  );
}