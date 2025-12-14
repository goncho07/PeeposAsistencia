'use client';
import { useState } from 'react';
import { UserProfile } from '@/types/userTypes';

interface ConfirmDelete {
    id: number;
    type: string;
}

export function useUserModals() {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isCarnetOpen, setIsCarnetOpen] = useState(false);

    return {
        selectedUser,
        setSelectedUser,
        userToEdit,
        setUserToEdit,
        confirmDelete,
        setConfirmDelete,
        isCreateOpen,
        setIsCreateOpen,
        isUpdateOpen,
        setIsUpdateOpen,
        isCarnetOpen,
        setIsCarnetOpen,
    };
}
