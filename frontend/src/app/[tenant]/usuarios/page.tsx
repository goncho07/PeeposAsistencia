'use client';
import { useState } from 'react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { UserTable } from '@/app/features/users/components/UserTable';
import { UserKPICard, UserSearchBar, UserFilters } from '@/app/features/users/components/shared';
import { UserDetailModal, UserEditModal, UserCreateModal, UserDeleteModal, CarnetGeneratorModal } from '@/app/features/users/components/modals';
import { ToastContainer } from '@/app/components/ui/base/Toast';
import { Users, GraduationCap, UserCircle, Shield, UsersRound, BookUser, ShieldCheck, UserCog } from 'lucide-react';
import { EntityType } from '@/lib/api/users';
import { useUsers, useUserModals, useUserSearch } from '@/app/features/users/hooks';
import { useToasts } from '@/app/hooks';

const ENTITY_CONFIG = {
  student: {
    title: 'Estudiantes',
    label: 'estudiante',
    labelCapitalized: 'Estudiante',
    icon: Users,
    bgIcon: UsersRound,
    colorClass: 'text-primary',
    bgLight: 'bg-primary/30',
    borderColor: 'border-primary/30',
  },
  teacher: {
    title: 'Docentes',
    label: 'docente',
    labelCapitalized: 'Docente',
    icon: GraduationCap,
    bgIcon: BookUser,
    colorClass: 'text-success',
    bgLight: 'bg-success/30',
    borderColor: 'border-success/30',
  },
  parent: {
    title: 'Apoderados',
    label: 'apoderado',
    labelCapitalized: 'Apoderado',
    icon: UserCircle,
    bgIcon: UserCog,
    colorClass: 'text-secondary',
    bgLight: 'bg-secondary/30',
    borderColor: 'border-secondary/30',
  },
  user: {
    title: 'Administrativos',
    label: 'usuario',
    labelCapitalized: 'Usuario',
    icon: Shield,
    bgIcon: ShieldCheck,
    colorClass: 'text-warning',
    bgLight: 'bg-warning/30',
    borderColor: 'border-warning/30',
  },
} as const;

const ENTITY_TYPES: EntityType[] = ['student', 'teacher', 'parent', 'user'];

export default function UsuariosPage() {
  const [activeType, setActiveType] = useState<EntityType>('student');

  const { entities, counts, loading, error, fetchAllData, deleteEntity } = useUsers();
  const { selectedEntity, modals, open, close } = useUserModals();
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    paginatedEntities,
    totalPages,
    totalFiltered,
  } = useUserSearch(entities[activeType], activeType);
  const { toasts, success, error: showError, removeToast } = useToasts();

  const config = ENTITY_CONFIG[activeType];

  const handleDeleteConfirm = async () => {
    if (!selectedEntity) return;

    try {
      await deleteEntity(selectedEntity.id, activeType);
      success('Eliminado exitosamente', `El ${config.label} ${selectedEntity.full_name} ha sido eliminado del sistema.`);
      close.delete();
    } catch (err: any) {
      showError('Error al eliminar', err.response?.data?.message || 'No se pudo eliminar el registro.');
    }
  };

  const handleEditSuccess = async () => {
    await fetchAllData();
    success(`${config.labelCapitalized} actualizado`, 'Los cambios se han guardado correctamente.');
  };

  const handleCreateSuccess = async () => {
    await fetchAllData();
    success(`${config.labelCapitalized} creado`, 'El nuevo registro se ha guardado exitosamente.');
  };

  return (
    <AppLayout>
      <HeroHeader
        title="Usuarios"
        subtitle="Gestiona estudiantes, docentes, apoderados y personal administrativo."
        icon={Users}
        breadcrumbs={[{ label: 'Usuarios' }]}
      />

      {error && (
        <div className="rounded-xl p-4 mb-4 bg-danger/10 border border-danger/20">
          <p className="text-sm font-medium text-danger text-center">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ENTITY_TYPES.map((type) => {
          const cfg = ENTITY_CONFIG[type];
          return (
            <UserKPICard
              key={type}
              title={cfg.title}
              count={counts[type]}
              icon={cfg.icon}
              bgIcon={cfg.bgIcon}
              colorClass={cfg.colorClass}
              bgLight={cfg.bgLight}
              borderColor={cfg.borderColor}
              active={activeType === type}
              loading={loading}
              onClick={() => setActiveType(type)}
            />
          );
        })}
      </div>

      <UserSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={open.create}
        onCarnetClick={open.carnet}
      />

      <div className="lg:hidden mb-4">
        <UserFilters
          entityType={activeType}
          entities={entities[activeType]}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {!loading && (
        <div className="mb-4 text-sm text-text-secondary">
          Mostrando {paginatedEntities.length} de {totalFiltered} {config.label}s
          {totalFiltered !== counts[activeType] && ` (filtrado de ${counts[activeType]} total)`}
        </div>
      )}

      <div className="flex gap-6">
        <div className="hidden lg:block">
          <UserFilters
            entityType={activeType}
            entities={entities[activeType]}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <UserTable
          entities={paginatedEntities}
          entityType={activeType}
          onView={open.detail}
          onEdit={open.edit}
          onDelete={open.delete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      </div>

      <UserDetailModal
        isOpen={modals.detail}
        onClose={close.detail}
        entity={selectedEntity}
        entityType={activeType}
      />

      <UserEditModal
        isOpen={modals.edit}
        onClose={close.edit}
        onSuccess={handleEditSuccess}
        entity={selectedEntity}
        entityType={activeType}
      />

      <UserDeleteModal
        isOpen={modals.delete}
        onClose={close.delete}
        onConfirm={handleDeleteConfirm}
        entity={selectedEntity}
        entityType={activeType}
      />

      <UserCreateModal
        isOpen={modals.create}
        onClose={close.create}
        onSuccess={handleCreateSuccess}
        entityType={activeType}
      />

      <CarnetGeneratorModal
        isOpen={modals.carnet}
        onClose={close.carnet}
        onSuccess={(message) => success('Carnets', message)}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AppLayout>
  );
}
