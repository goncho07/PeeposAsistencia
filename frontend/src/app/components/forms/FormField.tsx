import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'number';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  currentValue?: string | number;
  showCurrentValue?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  pattern?: string;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  error,
  currentValue,
  showCurrentValue = false,
  disabled = false,
  min,
  max,
  pattern,
  autoComplete
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {showCurrentValue && currentValue !== undefined && currentValue !== '' && (
        <p className="text-xs mb-2 opacity-60">
          Actual: {currentValue}
        </p>
      )}

      <div className={icon ? "relative input-with-icon" : ""}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none"
               style={{ color: 'var(--color-text-secondary)' }}>
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`input ${error ? 'border-red-500' : ''}`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
