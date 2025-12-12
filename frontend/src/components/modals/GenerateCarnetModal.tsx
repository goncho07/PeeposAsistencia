import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Loader2, CheckCircle2, Users } from 'lucide-react';
import { UserProfile, isStudent, isTeacher } from '@/types/userTypes';
import { useCarnetGeneration } from '@/hooks/useCarnetGeneration';
import { useAulasFilters } from '@/hooks/useAulasFilters';

interface GenerateCarnetModalProps {
    isOpen: boolean;
    users: UserProfile[];
    onClose: () => void;
    onSuccess: (message: string) => void;
}

const GenerateCarnetModal: React.FC<GenerateCarnetModalProps> = ({
    isOpen,
    users,
    onClose,
    onSuccess
}) => {
    const [userType, setUserType] = useState<'all' | 'student' | 'teacher'>('all');

    const {
        niveles,
        grados,
        secciones,
        selectedNivel,
        selectedGrado,
        selectedSeccion,
        setSelectedNivel,
        setSelectedGrado,
        setSelectedSeccion
    } = useAulasFilters();

    const { generating, progress, error, generateCarnets } = useCarnetGeneration();

    // Filtrar usuarios elegibles (solo estudiantes y docentes)
    const eligibleUsers = useMemo(() => {
        return users.filter(user => isStudent(user) || isTeacher(user));
    }, [users]);

    // Aplicar filtros masivos
    const filteredUsers = useMemo(() => {
        return eligibleUsers.filter(user => {
            // Filtro por tipo
            if (userType === 'student' && !isStudent(user)) return false;
            if (userType === 'teacher' && !isTeacher(user)) return false;

            // Filtro por nivel
            if (selectedNivel) {
                if (isStudent(user)) {
                    if (user.level !== selectedNivel) return false;
                } else if (isTeacher(user)) {
                    if (user.level !== selectedNivel) return false;
                }
            }

            // Filtros adicionales solo para estudiantes
            if (isStudent(user)) {
                if (selectedGrado && user.grade !== selectedGrado) return false;
                if (selectedSeccion && user.section !== selectedSeccion) return false;
            }

            return true;
        });
    }, [eligibleUsers, userType, selectedNivel, selectedGrado, selectedSeccion]);

    // Manejar generación
    const handleGenerate = async () => {
        if (filteredUsers.length === 0) return;

        const usersByType = filteredUsers.map(user => ({
            id: user.id,
            type: isStudent(user) ? 'student' as const : 'teacher' as const
        }));

        try {
            await generateCarnets(usersByType);
            onSuccess(`Se generaron ${filteredUsers.length} carnets exitosamente`);
            onClose();
        } catch (err) {
            // Error ya manejado por el hook
        }
    };

    // Prevenir cierre durante generación
    React.useEffect(() => {
        if (generating) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = '';
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [generating]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={!generating ? onClose : undefined}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-purple-600 dark:bg-purple-700 p-6 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard size={24} />
                        Generar Carnets Masivamente
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={generating}
                        className="hover:bg-white/20 p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!generating ? (
                        <>
                            {/* Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    Los carnets se generarán para todos los usuarios que coincidan con los filtros seleccionados.
                                </p>
                            </div>

                            {/* Filtros */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                                    Filtros de Selección
                                </h3>

                                {/* Tipo de Usuario */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Usuario <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'all', label: 'Todos' },
                                            { value: 'student', label: 'Estudiantes' },
                                            { value: 'teacher', label: 'Docentes' }
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => {
                                                    setUserType(type.value as any);
                                                    // Resetear filtros al cambiar tipo
                                                    setSelectedNivel('');
                                                    setSelectedGrado('');
                                                    setSelectedSeccion('');
                                                }}
                                                className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${userType === type.value
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Nivel */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Nivel
                                    </label>
                                    <select
                                        value={selectedNivel}
                                        onChange={(e) => setSelectedNivel(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800"
                                    >
                                        <option value="">Todos los niveles</option>
                                        {niveles.map(nivel => (
                                            <option key={nivel} value={nivel}>{nivel}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Grado y Sección - Solo para estudiantes */}
                                {userType !== 'teacher' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Grado
                                            </label>
                                            <select
                                                value={selectedGrado}
                                                onChange={(e) => setSelectedGrado(e.target.value)}
                                                disabled={!selectedNivel}
                                                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 disabled:opacity-50"
                                            >
                                                <option value="">Todos los grados</option>
                                                {grados.map(grado => (
                                                    <option key={grado} value={grado}>{grado}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Sección
                                            </label>
                                            <select
                                                value={selectedSeccion}
                                                onChange={(e) => setSelectedSeccion(e.target.value)}
                                                disabled={!selectedGrado}
                                                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 disabled:opacity-50"
                                            >
                                                <option value="">Todas las secciones</option>
                                                {secciones.map(seccion => (
                                                    <option key={seccion} value={seccion}>{seccion}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resumen */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={20} className="text-purple-600 dark:text-purple-400" />
                                    <h4 className="font-bold text-purple-900 dark:text-purple-100">
                                        Resumen de Generación
                                    </h4>
                                </div>
                                <p className="text-sm text-purple-900 dark:text-purple-100">
                                    Se generarán <span className="font-bold text-lg">{filteredUsers.length}</span> carnets
                                    {filteredUsers.length === 0 && (
                                        <span className="block mt-1 text-red-600 dark:text-red-400">
                                            No hay usuarios que coincidan con los filtros seleccionados
                                        </span>
                                    )}
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Progress */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-purple-600" size={48} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Generando Carnets...
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {progress.current} de {progress.total} procesados
                            </p>
                            <div className="w-full max-w-md bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-purple-600 h-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
                                ⚠️ No cierres esta ventana hasta que finalice el proceso
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!generating && (
                    <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={filteredUsers.length === 0}
                            className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={20} />
                            Generar {filteredUsers.length > 0 && `(${filteredUsers.length})`} Carnets
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default GenerateCarnetModal;