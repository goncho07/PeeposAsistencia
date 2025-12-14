'use client';
import React, { useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import AlertModal from '@/components/ui/AlertModal';
import { BaseModal } from '@/components/ui/BaseModal';
import { useUserForm } from '@/hooks/useUserForm';
import { UserProfile } from '@/types/userTypes';

export interface DynamicField {
    name: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date' | 'email' | 'password';
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string; }[];
    grid?: 1 | 2 | 3;
    maxLength?: number;
    defaultValue?: any;
    isAcademic?: boolean;
}

export interface DynamicFormConfig {
    title: string;
    submitLabel: string;
    cancelLabel?: string;
    color?: string;
    fields: DynamicField[];
}

interface DynamicFormModalProps {
    isOpen: boolean;
    config: DynamicFormConfig;
    initialData?: Record<string, any>;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    contentTop?: React.ReactNode;
    users?: UserProfile[];
}

export const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
    isOpen,
    config,
    initialData = {},
    onClose,
    onSubmit,
    contentTop,
    users,
}) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const {
        formData,
        handleChange,
        enrichedFields,
        hasAcademic,
    } = useUserForm({ fields: config.fields, initialData, users });

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            let message = 'Error al enviar el formulario';

            if (err.response?.status === 422 && err.response.data?.errors) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors).flat()[0];
                message = firstError || err.response.data.message || message;
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.message) {
                message = err.message;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const grouped = useMemo(() => {
        const cols: Record<number, DynamicField[]> = { 1: [], 2: [], 3: [] };
        enrichedFields
            .filter(f => !f.isAcademic)
            .forEach(f => cols[f.grid || 1].push(f));
        return cols;
    }, [enrichedFields]);

    const academicFields = useMemo(
        () => enrichedFields.filter(f => f.isAcademic),
        [enrichedFields]
    );

    const color = config.color || 'blue';

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="flex flex-col h-full">
                <div className={`p-6 bg-${color}-600 text-white flex justify-between items-center`}>
                    <h2 className="font-bold text-xl">{config.title}</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {contentTop}

                    {([3, 2, 1] as const).map(cols =>
                        grouped[cols].length ? (
                            <div key={cols} className={`grid grid-cols-${cols} gap-4`}>
                                {grouped[cols].map(field => (
                                    <FormField
                                        key={field.name}
                                        name={field.name}
                                        label={field.label}
                                        type={field.type}
                                        required={field.required}
                                        value={formData[field.name] || ''}
                                        onChange={val => handleChange(field.name, val)}
                                        options={field.options}
                                        maxLength={field.maxLength}
                                    />
                                ))}
                            </div>
                        ) : null
                    )}

                    {hasAcademic && (
                        <div className="bg-blue-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                            <h3 className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                                INFORMACIÓN ACADÉMICA
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {academicFields.map(field => (
                                    <FormField
                                        key={field.name}
                                        name={field.name}
                                        label={field.label}
                                        type={field.type}
                                        required={field.required}
                                        value={formData[field.name] || ''}
                                        onChange={val => handleChange(field.name, val)}
                                        options={field.options}
                                        maxLength={field.maxLength}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {config.cancelLabel || 'Cancelar'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2 bg-${color}-600 text-white font-bold rounded-lg hover:bg-${color}-700 flex items-center gap-2 transition-colors disabled:opacity-50`}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {config.submitLabel}
                    </button>
                </div>
            </div>

            {error && <AlertModal type="error" message={error} onClose={() => setError(null)} />}
        </BaseModal>
    );
};
