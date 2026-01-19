import React from 'react';

export interface BadgeProps {
  variant: 'success' | 'danger' | 'warning' | 'primary' | 'secondary';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  variant,
  children,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    success: 'bg-success/10 text-success dark:bg-success-light/20 dark:text-success-light',
    danger: 'bg-danger/10 text-danger dark:bg-danger-light/20 dark:text-danger-light',
    warning: 'bg-warning/10 text-warning dark:bg-warning-light/20 dark:text-warning-light',
    primary: 'bg-primary/10 text-primary dark:bg-primary-light/20 dark:text-primary-light',
    secondary: 'bg-secondary/10 text-secondary dark:bg-secondary-light/20 dark:text-secondary-light',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
