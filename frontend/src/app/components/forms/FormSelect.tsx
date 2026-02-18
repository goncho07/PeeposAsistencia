import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  currentValue?: string;
  showCurrentValue?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  required = false,
  icon,
  error,
  currentValue,
  showCurrentValue = false,
  disabled = false,
  emptyMessage
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {showCurrentValue && currentValue && (
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

        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`input ${error ? 'border-red-500' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.length === 0 && emptyMessage ? (
            <option value="" disabled>{emptyMessage}</option>
          ) : (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          )}
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
