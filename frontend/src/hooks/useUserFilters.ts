'use client';
import { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '@/types/userTypes';

export function useUserFilters(users: UserProfile[], itemsPerPage: number = 12) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedUserType, setSelectedUserType] = useState('Estudiante');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                (user.fullName || '').toLowerCase().includes(query) ||
                user.dni.includes(query) ||
                (user.email && user.email.toLowerCase().includes(query));

            const matchesStudentCode =
                user.type === 'Estudiante' && 'studentCode' in user
                    ? user.studentCode.includes(searchQuery)
                    : false;

            const matchesStudentLevel =
                user.type === 'Estudiante' && user.aulaInfo?.level
                    ? user.aulaInfo.level.toLowerCase().includes(query)
                    : false;

            const matchesLevel =
                user.type === 'Docente' && user.level
                    ? user.level.toLowerCase().includes(query)
                    : false;


            const matchesType =
                selectedUserType === 'Todos' || user.type === selectedUserType;

            return (matchesSearch || matchesStudentCode || matchesStudentLevel || matchesLevel) && matchesType;
        });
    }, [users, searchQuery, selectedUserType]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredUsers.slice(start, end);
    }, [filteredUsers, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedUserType]);

    return {
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        selectedUserType,
        setSelectedUserType,
        currentPage,
        setCurrentPage,
        filteredUsers,
        paginatedUsers,
        totalPages,
    };
}
