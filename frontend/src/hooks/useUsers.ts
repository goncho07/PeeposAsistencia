import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { ApiUserResponse, UserProfile } from '@/types/userTypes';
import { mapUserData } from '@/lib/mappers/apiToUserMapper';

export const useUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            console.time('fetchUsers-total');
            setLoading(true);
            setError(null);

            console.time('fetchUsers-api');
            const { data } = await api.get<ApiUserResponse[]>('/users');
            console.timeEnd('fetchUsers-api'); // 🔍 mide la respuesta HTTP

            console.time('fetchUsers-map');
            const mappedUsers = data.map(mapUserData);
            console.timeEnd('fetchUsers-map'); // 🔍 mide el mapeo local

            setUsers(mappedUsers);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            setError(error.response?.data?.message || 'Error al cargar usuarios');
        } finally {
            console.timeEnd('fetchUsers-total');
            setLoading(false);
        }
    };


    const deleteUser = async (userId: number, userType: string) => {
        const typeMap: Record<string, string> = {
            'Estudiante': 'student',
            'Docente': 'teacher',
            'Administrativo': 'admin',
            'Apoderado': 'parent'
        };

        await api.delete(`/users/${userId}`, {
            params: { type: typeMap[userType] }
        });

        setUsers(prev => prev.filter(u => !(u.id === userId && u.type === userType)));
    };

    const counts = useMemo(() => ({
        Estudiante: users.filter(u => u.type === 'Estudiante').length,
        Docente: users.filter(u => u.type === 'Docente').length,
        Administrativo: users.filter(u => u.type === 'Administrativo').length,
        Apoderado: users.filter(u => u.type === 'Apoderado').length,
    }), [users]);

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        counts,
        fetchUsers,
        deleteUser
    };
};