import React from 'react';

export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel' | 'url';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon,
  actionIcon,
  onActionClick,
  className = '',
  min,
  max,
  step,
}: InputProps) {
  const hasIcon = !!icon;
  const hasActionIcon = !!actionIcon;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xl font-medium mb-2 text-text-primary">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {hasIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-icon">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`
            w-full px-4 py-2 rounded-lg
            border border-border
            bg-background
            text-xl text-text-secondary
            placeholder:text-text-secondary/50
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${hasIcon ? 'pl-11' : ''}
            ${hasActionIcon ? 'pr-11' : ''}
            ${error ? 'border-danger focus:ring-danger' : ''}
            ${type === 'date' || type === 'time' ? 'input-date' : ''}
          `}
        />

        {hasActionIcon && (
          <button
            type="button"
            onClick={onActionClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-input transition-colors cursor-pointer"
          >
            {actionIcon}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
