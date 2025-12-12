'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserDetailModal from '@/components/modals/UserDetailModal';
import CreateUserModal from '@/components/modals/CreateUserModal';
import UpdateUserModal from '@/components/modals/UpdateUserModal';
import GenerateCarnetModal from '@/components/modals/GenerateCarnetModal';
import Toast from '@/components/ui/Toast';
import ErrorMessage from '@/components/ui/ErrorMessage';
import UsersHeader from '@/components/users/UserHeader';
import UsersToolbar from '@/components/users/UsersToolbar';
import UsersContent from '@/components/users/UsersContent';
import UsersFilters from '@/components/users/UserFilters';
import AlertModal from '@/components/ui/AlertModal';
import { useUsers } from '@/hooks/useUsers';
import { UserProfile } from '@/types/userTypes';
import { useAuth } from '@/context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUserType, setSelectedUserType] = useState<string>('Estudiante');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCarnetModalOpen, setIsCarnetModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; type: string } | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  const { user: currentUser } = useAuth();

  const { users, loading, error, counts, fetchUsers, deleteUser } = useUsers();

  const itemsPerPage = 12;

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.dni.includes(searchQuery) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStudentCode = user.type === 'Estudiante' && 'studentCode' in user
        ? user.studentCode.includes(searchQuery)
        : false;

      const matchesType = selectedUserType === 'Todos' || user.type === selectedUserType;
      return (matchesSearch || matchesStudentCode) && matchesType;
    });
  }, [searchQuery, selectedUserType, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedUserType]);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleDeleteUser = (userId: number, userType: string) => {
    if (currentUser?.id === userId) {
      showToastMessage('No puedes eliminar tu propio usuario.', 'error');
      return;
    }

    setConfirmDelete({ id: userId, type: userType });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;

    try {
      await deleteUser(confirmDelete.id, confirmDelete.type);
      showToastMessage('Usuario eliminado exitosamente', 'success');
      setConfirmDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      showToastMessage(error.response?.data?.message || 'Error al eliminar usuario', 'error');
      setConfirmDelete(null);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setUserToEdit(user);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col"
      >
        <UsersHeader totalUsers={users.length} loading={loading} />

        {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

        <UsersFilters
          counts={counts}
          selectedType={selectedUserType}
          onSelectType={setSelectedUserType}
        />

        <UsersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateUser={() => setIsCreateModalOpen(true)}
          onGenerateCarnets={() => setIsCarnetModalOpen(true)}
        />

        <UsersContent
          users={paginatedUsers}
          loading={loading}
          viewMode={viewMode}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onViewUser={setSelectedUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

        <AnimatePresence>
          {selectedUser && (
            <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateModalOpen && (
            <CreateUserModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={(message) => {
                fetchUsers();
                showToastMessage(message, 'success');
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUpdateModalOpen && (
            <UpdateUserModal
              isOpen={isUpdateModalOpen}
              user={userToEdit}
              onClose={() => {
                setIsUpdateModalOpen(false);
                setUserToEdit(null);
              }}
              onSuccess={(message) => {
                fetchUsers();
                showToastMessage(message, 'success');
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCarnetModalOpen && (
            <GenerateCarnetModal
              isOpen={isCarnetModalOpen}
              users={users}
              onClose={() => setIsCarnetModalOpen(false)}
              onSuccess={(message) => {
                showToastMessage(message, 'success');
              }}
            />
          )}
        </AnimatePresence>

        {confirmDelete && (
          <AlertModal
            type="warning"
            title="Eliminar usuario"
            message="¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onConfirm={confirmDeleteUser}
            onClose={() => setConfirmDelete(null)}
          />
        )}

        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </motion.div>
    </div>
  );
}