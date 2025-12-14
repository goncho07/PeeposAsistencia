import api from '@/lib/axios';
import { useState, useEffect, useMemo } from 'react';
import { ApiUserResponse, UserProfile } from '@/types/userTypes'
import { mapUserData } from '@/lib/mappers/userMapper';
import { UserType } from '@/config/userFormConfig';

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

    const createUser = async (data: Record<string, any>, userType: string) => {
        try {
            const typeMap: Record<string, string> = {
                student: 'student',
                teacher: 'teacher',
                admin: 'admin',
                parent: 'parent',
            };

            const endpoint = `/users/${typeMap[userType]}`;
            await api.post(endpoint, data);
        } catch (err: any) {
            console.error('Error creating user:', err);
            throw err;
        }
    };

    const updateUser = async (id: number, payload: Record<string, any>, type: UserType) => {
        try {
            const endpoint = `/users/${type}/${id}`;

            await api.put(endpoint, payload);
        } catch (error: any) {
            console.error('Error updating user:', error);
            throw error;
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

    return { users, loading, error, counts, fetchUsers, createUser, updateUser, deleteUser };
};