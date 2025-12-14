'use client';
import { motion, AnimatePresence } from 'framer-motion';
import UserDetailModal from '@/components/modals/UserDetailModal';
import Toast from '@/components/ui/Toast';
import ErrorMessage from '@/components/ui/ErrorMessage';
import UsersHeader from '@/components/users/UsersHeader';
import UsersToolbar from '@/components/users/UsersToolbar';
import UsersContent from '@/components/users/UsersContent';
import UsersFilters from '@/components/users/UsersFilters';
import AlertModal from '@/components/ui/AlertModal';
import { UserProfile } from '@/types/userTypes';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useUsers } from '@/hooks/useUsers';
import { useCarnets } from '@/hooks/useCarnets';
import { useUserModals } from '@/hooks/useUserModals';  
import { useUserFilters } from '@/hooks/useUserFilters';
import { CreateUserFormModal } from '@/components/modals/CreateUserFormModal';
import { UpdateUserFormModal } from '@/components/modals/UpdateUserFormModal';
import { CarnetFormModal } from '@/components/modals/CarnetFormModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function UsersPage() {
  const { user: session } = useAuth();
  const { message, type, isVisible, showToast, hideToast } = useToast();
  const { users, loading, error, counts, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const { generateCarnet } = useCarnets();

  const {
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
  } = useUserModals();

  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedUserType,
    setSelectedUserType,
    currentPage,
    setCurrentPage,
    paginatedUsers,
    totalPages,
  } = useUserFilters(users, 12);

  const handleEditUser = (user: UserProfile) => {
    setUserToEdit(user);
    setIsUpdateOpen(true);
  };

  const handleDeleteUser = (userId: number, userType: string) => {
    if (session?.id === userId) {
      showToast('No puedes eliminar tu propio usuario.', 'error');
      return;
    }

    setConfirmDelete({ id: userId, type: userType });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;

    try {
      await deleteUser(confirmDelete.id, confirmDelete.type);
      showToast('Usuario eliminado exitosamente', 'success');
      setConfirmDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      showToast(error.response?.data?.message || 'Error al eliminar usuario', 'error');
      setConfirmDelete(null);
    }
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
          onCreateUser={() => setIsCreateOpen(true)}
          onGenerateCarnets={() => setIsCarnetOpen(true)}
        />

        <UsersContent
          users={paginatedUsers}
          loading={loading}
          viewMode={viewMode}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={12}
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
          {isCreateOpen && (
            <CreateUserFormModal  
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onSubmit={async (formData) => {
                await createUser(formData, formData.type || 'student');
                fetchUsers();
                showToast('Usuario creado exitosamente', 'success');
              }}
              users={users}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUpdateOpen && userToEdit && (
            <UpdateUserFormModal
              isOpen={isUpdateOpen}
              onClose={() => setIsUpdateOpen(false)}
              user={userToEdit}
              users={users}
              onSubmit={async (id, data, type) => {
                await updateUser(id, data, type);
                showToast('Usuario actualizado exitosamente', 'success');
                fetchUsers();
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCarnetOpen && (
            <CarnetFormModal
              isOpen={isCarnetOpen}
              onClose={() => setIsCarnetOpen(false)}
              users={users}
              onSubmit={async (data) => {
                try {
                  setIsCarnetOpen(false);
                  showToast('Generando carnets, por favor espere…', 'info');

                  await generateCarnet({
                    type: data.type,
                    level: data.level as 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA' | undefined,
                    grade: data.grade,
                    section: data.section,
                  });

                  showToast('Carnets generados correctamente', 'success');
                } catch {
                  showToast('Error al generar carnets', 'error');
                }
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
          message={message}
          type={type}
          isVisible={isVisible}
          onClose={hideToast}
        />
      </motion.div>
    </div>
  );
}