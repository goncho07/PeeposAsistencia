'use client';
import React from 'react';
import { DynamicFormModal } from '@/components/modals/DynamicFormModal';
import { FIELD_CONFIGS, COMMON_FIELDS, USER_TYPES, UserType } from '@/config/userFormConfig';
import { UserProfile } from '@/types/userTypes';

interface UpdateUserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onSubmit: (id: number, data: Record<string, any>, type: UserType) => Promise<void>;
    users?: UserProfile[];
}

export const UpdateUserFormModal: React.FC<UpdateUserFormModalProps> = ({
    isOpen,
    onClose,
    user,
    onSubmit,
    users
}) => {
    const userType = React.useMemo<UserType>(() => {
        switch (user?.type?.toLowerCase()) {
            case 'estudiante':
            case 'student':
                return 'student';
            case 'docente':
            case 'teacher':
                return 'teacher';
            case 'administrativo':
            case 'admin':
                return 'admin';
            case 'apoderado':
            case 'parent':
                return 'parent';
            default:
                return 'student';
        }
    }, [user]);

    const fields = React.useMemo(() => {
        if (!userType) return [];
        return [...COMMON_FIELDS, ...FIELD_CONFIGS[userType]];
    }, [userType]);

    const initialData = React.useMemo(() => {
        if (!user) return {};

        const base = (user as UserProfile).rawData ?? user;

        return Object.fromEntries(
            Object.entries(base).map(([key, value]) => [key, value ?? ''])
        );
    }, [user]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (!user) return;
        await onSubmit(user.id, data, userType);
    };

    return (
        <DynamicFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            config={{
                title: `Editar ${USER_TYPES.find(u => u.value === userType)?.label}`,
                submitLabel: 'Actualizar',
                fields,
            }}
            initialData={initialData}
            users={users}
        />
    );
};
