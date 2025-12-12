import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, X, Loader2 } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import AlertModal from '@/components/ui/AlertModal';
import { useUserForm } from '@/hooks/useUsersForm';
import {
    COMMON_FIELDS,
    FIELD_CONFIGS,
    UserType
} from '@/config/userFormConfig';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const USER_TYPES = [
    { value: 'student', label: 'Estudiante' },
    { value: 'teacher', label: 'Docente' },
    { value: 'admin', label: 'Administrativo' },
    { value: 'parent', label: 'Apoderado' }
];

interface UserFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'update';
    initialUserType?: UserType;
    initialData?: Record<string, any>;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    mode,
    initialUserType = 'student',
    initialData,
    onClose,
    onSuccess
}) => {
    const [userType, setUserType] = React.useState<UserType>(initialUserType);

    const {
        loading,
        errorMessage,
        setErrorMessage,
        formData,
        aulas,
        padres,
        selectedNivel,
        selectedGrado,
        selectedSeccion,
        setSelectedNivel,
        setSelectedGrado,
        setSelectedSeccion,
        handleFieldChange,
        handleSubmit,
        hasChanges
    } = useUserForm({ userType, mode, initialData, onSuccess, onClose });

    const niveles = useMemo(() => Array.from(new Set(aulas.map(a => a.level))), [aulas]);

    const grados = useMemo(() => {
        if (!selectedNivel) return [];
        return Array.from(
            new Set(aulas.filter(a => a.level === selectedNivel).map(a => a.grade))
        ).sort((a, b) => a - b);
    }, [aulas, selectedNivel]);

    const secciones = useMemo(() => {
        if (!selectedNivel || !selectedGrado) return [];
        return Array.from(
            new Set(
                aulas
                    .filter(a => a.level === selectedNivel && a.grade === Number(selectedGrado))
                    .map(a => a.section)
            )
        );
    }, [aulas, selectedNivel, selectedGrado]);

    const enrichedFields = useMemo(() => {
        return FIELD_CONFIGS[userType].map(field => {
            if (field.name === 'padre_id') {
                return {
                    ...field,
                    options: [
                        { value: '', label: 'Sin apoderado' },
                        ...padres.map(p => ({ value: p.id.toString(), label: p.full_name }))
                    ]
                };
            }

            if (field.name === 'level') {
                return {
                    ...field,
                    options: niveles.map(n => ({ value: n, label: n }))
                };
            }

            return field;
        });
    }, [userType, padres]);

    const requiredFields = useMemo(() => {
        const allFields = [...COMMON_FIELDS, ...FIELD_CONFIGS[userType]];
        return allFields.filter(f => f.required).map(f => f.name);
    }, [userType]);

    const allFieldsConfig = useMemo(() => {
        return [...COMMON_FIELDS, ...FIELD_CONFIGS[userType]];
    }, [userType]);

    const renderFields = (fields: typeof enrichedFields) => {
        const grouped: Record<number, typeof enrichedFields> = { 1: [], 2: [], 3: [] };
        fields.forEach(field => {
            grouped[field.gridCol || 1].push(field);
        });

        return (
            <>
                {grouped[3].length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {grouped[3].map(field => (
                            <FormField
                                key={field.name}
                                {...field}
                                required={mode === 'update' && field.requiredOnUpdate === false ? false : field.required}
                                value={formData[field.name] || ''}
                                onChange={(value) => handleFieldChange(field.name, value)}
                            />
                        ))}
                    </div>
                )}
                {grouped[2].length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {grouped[2].map(field => (
                            <FormField
                                key={field.name}
                                {...field}
                                required={mode === 'update' && field.requiredOnUpdate === false ? false : field.required}
                                value={formData[field.name] || ''}
                                onChange={(value) => handleFieldChange(field.name, value)}
                            />
                        ))}
                    </div>
                )}
                {grouped[1].length > 0 && (
                    <div className="space-y-4">
                        {grouped[1].map(field => (
                            <FormField
                                key={field.name}
                                {...field}
                                required={mode === 'update' && field.requiredOnUpdate === false ? false : field.required}
                                value={formData[field.name] || ''}
                                onChange={(value) => handleFieldChange(field.name, value)}
                            />
                        ))}
                    </div>
                )}
            </>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                onClick={onClose}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700 max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-blue-600 dark:bg-blue-700 p-6 flex justify-between items-center text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <User size={24} />
                            {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-4">
                        {mode === 'create' && (
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                    Tipo de Usuario <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {USER_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setUserType(type.value as UserType)}
                                            className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${userType === type.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            {COMMON_FIELDS.map(field => (
                                <FormField
                                    key={field.name}
                                    {...field}
                                    value={formData[field.name] || ''}
                                    onChange={(value) => handleFieldChange(field.name, value)}
                                />
                            ))}
                        </div>

                        {renderFields(enrichedFields)}

                        {userType === 'student' && (
                            <div className="bg-blue-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                                <h3 className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                                    INFORMACIÓN ACADÉMICA
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nivel
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
                                            value={selectedNivel}
                                            onChange={e => {
                                                setSelectedNivel(e.target.value);
                                                setSelectedGrado('');
                                                setSelectedSeccion('');
                                                handleFieldChange('aula_id', '');
                                            }}
                                        >
                                            <option value="">Seleccionar</option>
                                            {niveles.map(nivel => (
                                                <option key={nivel} value={nivel}>
                                                    {nivel}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Grado
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 disabled:opacity-60"
                                            disabled={!selectedNivel}
                                            value={selectedGrado}
                                            onChange={e => {
                                                setSelectedGrado(e.target.value);
                                                setSelectedSeccion('');
                                                handleFieldChange('aula_id', '');
                                            }}
                                        >
                                            <option value="">Seleccionar</option>
                                            {grados.map(grado => (
                                                <option key={grado} value={grado}>
                                                    {grado}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Sección
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 disabled:opacity-60"
                                            disabled={!selectedGrado}
                                            value={selectedSeccion}
                                            onChange={e => {
                                                const seccion = e.target.value;
                                                setSelectedSeccion(seccion);

                                                const aula = aulas.find(
                                                    a =>
                                                        a.level === selectedNivel &&
                                                        a.grade === Number(selectedGrado) &&
                                                        a.section === seccion
                                                );
                                                if (aula) handleFieldChange('aula_id', aula.id.toString());
                                            }}
                                        >
                                            <option value="">Seleccionar</option>
                                            {secciones.map(seccion => (
                                                <option key={seccion} value={seccion}>
                                                    {seccion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleSubmit(requiredFields, allFieldsConfig)}
                            disabled={loading || (mode === 'update' && !hasChanges)}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={mode === 'update' && !hasChanges ? 'No hay cambios para guardar' : ''}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {errorMessage && (
                <AlertModal
                    type="error"
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            )}
        </>
    );
};

export default UserFormModal;