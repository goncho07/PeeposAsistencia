import { useState, useMemo, useEffect } from 'react';
import api from '@/lib/axios';

interface Aula {
    id: number;
    level: string;
    grade: number;
    section: string;
    full_name: string;
}

export const useAulasFilters = () => {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNivel, setSelectedNivel] = useState<string>('');
    const [selectedGrado, setSelectedGrado] = useState<string>('');
    const [selectedSeccion, setSelectedSeccion] = useState<string>('');

    // Cargar aulas al montar
    useEffect(() => {
        const fetchAulas = async () => {
            try {
                const { data } = await api.get('/aulas');
                setAulas(Array.isArray(data) ? data : data.aulas || []);

            } catch (error) {
                console.error('Error loading aulas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAulas();
    }, []);

    // Obtener niveles únicos
    const niveles = useMemo(() => {
        return Array.from(new Set(aulas.map(a => a.level))).sort();
    }, [aulas]);

    // Obtener grados filtrados por nivel
    const grados = useMemo(() => {
        if (!selectedNivel) return [];
        return Array.from(
            new Set(aulas.filter(a => a.level === selectedNivel).map(a => a.grade))
        ).sort((a, b) => a - b);
    }, [aulas, selectedNivel]);

    // Obtener secciones filtradas por nivel y grado
    const secciones = useMemo(() => {
        if (!selectedNivel || !selectedGrado) return [];
        return Array.from(
            new Set(
                aulas
                    .filter(a => a.level === selectedNivel && a.grade === Number(selectedGrado))
                    .map(a => a.section)
            )
        ).sort();
    }, [aulas, selectedNivel, selectedGrado]);

    // Resetear filtros
    const resetFilters = () => {
        setSelectedNivel('');
        setSelectedGrado('');
        setSelectedSeccion('');
    };

    // Resetear grado y sección cuando cambia nivel
    const handleNivelChange = (nivel: string) => {
        setSelectedNivel(nivel);
        setSelectedGrado('');
        setSelectedSeccion('');
    };

    // Resetear sección cuando cambia grado
    const handleGradoChange = (grado: string) => {
        setSelectedGrado(grado);
        setSelectedSeccion('');
    };

    return {
        aulas,
        loading,
        niveles,
        grados,
        secciones,
        selectedNivel,
        selectedGrado,
        selectedSeccion,
        setSelectedNivel: handleNivelChange,
        setSelectedGrado: handleGradoChange,
        setSelectedSeccion,
        resetFilters
    };
};