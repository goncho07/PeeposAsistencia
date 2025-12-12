import React from 'react';
import UserFormModal from '@/components/modals/UserFormModal';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <UserFormModal
      isOpen={isOpen}
      mode="create"
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CreateUserModal;