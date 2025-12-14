import api from '@/lib/axios';
import { useEffect, useState, useMemo } from 'react';
import { DynamicField } from '@/components/modals/DynamicFormModal';
import { ApiUserResponse, PadreData, UserProfile, isParent } from '@/types/userTypes';
import { useAulas } from '@/hooks/useAulas';

interface UseUserFormProps {
    fields: DynamicField[];
    initialData?: Record<string, any>;
    users?: UserProfile[];
}

export const useUserForm = ({ fields, initialData = {}, users }: UseUserFormProps) => {
    const {
        aulas,
        niveles,
        grados,
        secciones,
        selectedNivel,
        setSelectedNivel,
        selectedGrado,
        setSelectedGrado,
        selectedSeccion,
        setSelectedSeccion,
    } = useAulas();

    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const defaults: Record<string, any> = {};
        fields.forEach(f => {
            if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
        });
        return { ...defaults, ...initialData };
    });

    const [padres, setPadres] = useState<PadreData[]>([]);
    const [selectedPadre, setSelectedPadre] = useState<string | null>(null);

    useEffect(() => {
        if (users && users.length > 0) {
            const parentUsers = users.filter(isParent).map(u => u.rawData as PadreData);
            setPadres(parentUsers);
        } else {
            fetchPadres();
        }
    }, []);

    const fetchPadres = async () => {
        try {
            const { data } = await api.get('/users');
            const parentUsers = data
                .filter((u: ApiUserResponse) => u.type === 'parent')
                .map((p: ApiUserResponse) => p.data as PadreData);
            setPadres(parentUsers);
        } catch (e) {
            console.error('Error fetching padres:', e);
        }
    };
    
    useEffect(() => {
        const levelFromData =
            initialData.level ||
            initialData.aula?.level ||
            '';
        const gradeFromData =
            initialData.grade?.toString() ||
            initialData.aula?.grade?.toString() ||
            '';
        const sectionFromData =
            initialData.section ||
            initialData.aula?.section ||
            '';

        if (initialData.padre_id) {
            setSelectedPadre(initialData.padre_id.toString());
            setFormData(prev => ({
                ...prev,
                padre_id: initialData.padre_id.toString(),
            }));
        }

        if (aulas.length > 0 && (levelFromData || gradeFromData || sectionFromData)) {
            setSelectedNivel(levelFromData);
            setSelectedGrado(gradeFromData);
            setSelectedSeccion(sectionFromData);

            const aula = aulas.find(
                a =>
                    a.level === levelFromData &&
                    a.grade === Number(gradeFromData) &&
                    a.section === sectionFromData
            );

            if (aula) {
                setFormData(prev => ({
                    ...prev,
                    aula_id: aula.id.toString(),
                    level: levelFromData,
                    grade: gradeFromData,
                    section: sectionFromData,
                }));
            }
        }
    }, [aulas, initialData]);

    useEffect(() => {
        const aula = aulas.find(
            a => a.level === selectedNivel && a.grade === Number(selectedGrado) && a.section === selectedSeccion
        );

        setFormData(prev => ({
            ...prev,
            level: selectedNivel || '',
            grade: selectedGrado || '',
            section: selectedSeccion || '',
            aula_id: aula ? aula.id.toString() : '',
        }));
    }, [selectedNivel, selectedGrado, selectedSeccion, aulas]);

    const enrichedFields = useMemo(() => {
        return fields.map(f => {
            let dynamicOptions: { value: string; label: string }[] = [];

            if (f.name === 'padre_id') {
                const baseOptions = padres.map(p => ({
                    value: p.id.toString(),
                    label: p.full_name,
                }));

                let reordered = baseOptions;
                if (selectedPadre) {
                    const selectedObj = baseOptions.find(opt => opt.value === selectedPadre);
                    if (selectedObj) {
                        reordered = [
                            selectedObj,
                            ...baseOptions.filter(opt => opt.value !== selectedPadre),
                        ];
                    }
                }

                dynamicOptions = [
                    { value: '', label: 'Seleccionar apoderado' },
                    ...reordered,
                ];
            }

            if (f.name === 'level') {
                dynamicOptions = niveles.map(n => ({ value: n, label: n }));
            }

            if (f.name === 'grade') {
                dynamicOptions = grados.map(g => ({ value: g.toString(), label: g.toString() }));
            }

            if (f.name === 'section') {
                dynamicOptions = secciones.map(s => ({ value: s, label: s }));
            }

            const options = f.options ? [...f.options, ...dynamicOptions] : dynamicOptions;

            return {
                ...f,
                options,
                disabled:
                    f.name === 'grade' ? !selectedNivel :
                        f.name === 'section' ? !selectedGrado :
                            f,
            };
        });
    }, [fields, padres, niveles, grados, secciones, selectedNivel, selectedGrado]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'level') {
            setSelectedNivel(value);
            setSelectedGrado('');
            setSelectedSeccion('');
        }
        if (name === 'grade') {
            setSelectedGrado(value);
            setSelectedSeccion('');
        }
        if (name === 'section') {
            setSelectedSeccion(value);
        }
    };

    const hasAcademic = fields.some(f => f.isAcademic);

    return {
        formData,
        enrichedFields,
        handleChange,
        selectedNivel,
        setSelectedNivel,
        selectedGrado,
        setSelectedGrado,
        selectedSeccion,
        setSelectedSeccion,
        niveles,
        grados,
        secciones,
        hasAcademic,
    };
};
