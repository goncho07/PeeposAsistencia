import api from '@/lib/axios';
import { useEffect, useState, useMemo } from 'react';

export interface Aula {
    id: number;
    level: string;
    grade: number;
    section: string;
}

export const useAulas = () => {
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [selectedNivel, setSelectedNivel] = useState('');
    const [selectedGrado, setSelectedGrado] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState('');

    useEffect(() => {
        const fetchAulas = async () => {
            try {
                const { data } = await api.get('/aulas');
                setAulas(Array.isArray(data) ? data : data.data || []);
            } catch (error) {
                console.error('Error fetching aulas:', error);
            }
        };
        fetchAulas();
    }, []);

    const niveles = useMemo(
        () => Array.from(new Set(aulas.map(a => a.level))),
        [aulas]
    );

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

    return {
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
    };
};
