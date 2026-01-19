import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'circle' | 'hover';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}: CardProps) {
  const baseClasses = 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark transition-all duration-200';

  const variantClasses = {
    default: 'rounded-xl shadow-sm',
    circle: 'rounded-[20%] shadow-sm',
    hover: 'rounded-xl shadow-sm hover:shadow-xl cursor-pointer',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactiveClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
