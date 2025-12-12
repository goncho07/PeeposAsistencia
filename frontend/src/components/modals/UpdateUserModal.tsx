import React, { useMemo } from 'react';
import UserFormModal from '@/components/modals/UserFormModal';
import { UserProfile } from '@/types/userTypes';
import { mapUserToFormData } from '@/lib/mappers/userToFormMapper';

interface UpdateUserModalProps {
    isOpen: boolean;
    user: UserProfile | null;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
    isOpen,
    user,
    onClose,
    onSuccess,
}) => {
    const { userType, initialData } = useMemo(
        () => (user ? mapUserToFormData(user) : { userType: 'student' as const, initialData: {} }),
        [user]
    );

    if (!user) return null;

    return (
        <UserFormModal
            isOpen={isOpen}
            mode="update"
            initialUserType={userType}
            initialData={initialData}
            onClose={onClose}
            onSuccess={onSuccess}
        />
    );
};

export default UpdateUserModal;
