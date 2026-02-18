import { useState, useCallback } from 'react';

interface UseFormDataOptions<T> {
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
}

interface UseFormDataReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  resetForm: () => void;
}

export function useFormData<T extends Record<string, any>>({
  initialData,
  onSubmit,
}: UseFormDataOptions<T>): UseFormDataReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSubmit(formData);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    setErrors,
    resetForm,
  };
}
