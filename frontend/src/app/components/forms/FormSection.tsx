import React from 'react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`form-section ${className}`}>
      <h3 className="section-title flex items-center gap-2 mb-4">
        {icon && <span className="opacity-70">{icon}</span>}
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
