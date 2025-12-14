import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { UserType, API_ENDPOINTS } from '@/config/userFormConfig';
import { AulaData, PadreData } from '@/types/userTypes';

interface UseUserFormProps {
    userType: UserType;
    mode: 'create' | 'update';
    initialData?: Record<string, any>;
    onSuccess: (message: string) => void;
    onClose: () => void;
}

export const useUserForm = ({ userType, mode, initialData, onSuccess, onClose }: UseUserFormProps) => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [originalData, setOriginalData] = useState<Record<string, any>>({});
    const [aulas, setAulas] = useState<AulaData[]>([]);
    const [padres, setPadres] = useState<PadreData[]>([]);
    const [selectedNivel, setSelectedNivel] = useState('');
    const [selectedGrado, setSelectedGrado] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState('');

    // Detectar si hay cambios en el formulario
    const hasChanges = useMemo(() => {
        if (mode === 'create') return true;

        // Comparar formData con originalData
        const keys = Object.keys(formData);
        return keys.some(key => {
            const currentValue = formData[key] || '';
            const originalValue = originalData[key] || '';

            // Ignorar el campo password si está vacío (no cambió)
            if (key === 'password' && !currentValue) return false;

            return currentValue !== originalValue;
        });
    }, [formData, originalData, mode]);

    useEffect(() => {
        fetchAulas();
        fetchPadres();
        initializeForm();
    }, [userType, initialData]);

    const fetchAulas = async () => {
        try {
            const { data } = await api.get('/aulas');
            setAulas(data.data || []);
        } catch (error) {
            console.error('Error fetching aulas:', error);
        }
    };

    const fetchPadres = async () => {
        try {
            const { data } = await api.get('/users');
            const parentUsers = data.data
                .filter((u: any) => u.type === 'parent')
                .map((p: any) => p.data as PadreData);
            setPadres(parentUsers);
        } catch (error) {
            console.error('Error fetching padres:', error);
        }
    };

    const initializeForm = () => {
        const defaults: Record<string, any> = {
            rol: 'SECRETARIO',
            document_type: 'DNI',
            gender: 'M',
            relationship_type: 'PADRE'
        };

        if (mode === 'update' && initialData) {
            const updatedData = { ...defaults, ...initialData };
            setFormData(updatedData);
            setOriginalData(updatedData); // Guardar datos originales para comparación

            // Inicializar selectores de aula si es estudiante
            if (userType === 'student' && initialData.aula_id) {
                const aula = aulas.find(a => a.id === initialData.aula_id);
                if (aula) {
                    setSelectedNivel(aula.level);
                    setSelectedGrado(aula.grade.toString());
                    setSelectedSeccion(aula.section);
                }
            }
        } else {
            setFormData(defaults);
            setOriginalData({});
        }
    };

    const handleFieldChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            rol: 'SECRETARIO',
            document_type: 'DNI',
            gender: 'M',
            relationship_type: 'PADRE'
        });
        setSelectedNivel('');
        setSelectedGrado('');
        setSelectedSeccion('');
    };

    const handleSubmit = async (requiredFields: string[], allFields: any[]) => {
        try {
            // Validación
            for (const field of requiredFields) {
                // En modo update, verificar si el campo tiene requiredOnUpdate
                if (mode === 'update') {
                    const fieldConfig = allFields.find(f => f.name === field);
                    if (fieldConfig?.requiredOnUpdate === false && !formData[field]) {
                        continue; // Saltar validación para campos no requeridos en update
                    }
                }

                if (!formData[field]) {
                    setErrorMessage(`Complete el campo requerido`);
                    return;
                }
            }

            if (userType === 'student' && !formData.aula_id) {
                setErrorMessage('Seleccione un aula válida');
                return;
            }

            setLoading(true);

            // Preparar datos: eliminar password si está vacío en modo update
            const submitData = { ...formData };
            if (mode === 'update' && !submitData.password) {
                delete submitData.password;
            }

            if (mode === 'create') {
                await api.post(API_ENDPOINTS[userType], submitData);
                onSuccess(`Usuario creado exitosamente`);
            } else {
                await api.put(`${API_ENDPOINTS[userType]}/${initialData?.id}`, submitData);
                onSuccess(`Usuario actualizado exitosamente`);
            }

            resetForm();
            onClose();
        } catch (error: any) {
            console.error(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} usuario:`, error);

            if (error.response?.status === 422 && error.response.data?.errors) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors).flat()[0];
                setErrorMessage(firstError as string);
                return;
            }

            const msg = error.response?.data?.message || error.message ||
                `Error al ${mode === 'create' ? 'crear' : 'actualizar'} usuario, revise los datos.`;
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
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
        resetForm,
        hasChanges
    };
};