import { useState, useCallback } from 'react';
import { Entity } from '@/lib/api/users';

export function useUserModals() {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [carnetModalOpen, setCarnetModalOpen] = useState(false);

  const openDetail = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setDetailModalOpen(true);
  }, []);

  const openEdit = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setEditModalOpen(true);
  }, []);

  const openDelete = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setDeleteModalOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const openCarnet = useCallback(() => {
    setCarnetModalOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setDetailModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setCreateModalOpen(false);
    setCarnetModalOpen(false);
    setSelectedEntity(null);
  }, []);

  return {
    selectedEntity,
    modals: {
      detail: detailModalOpen,
      edit: editModalOpen,
      delete: deleteModalOpen,
      create: createModalOpen,
      carnet: carnetModalOpen,
    },
    open: {
      detail: openDetail,
      edit: openEdit,
      delete: openDelete,
      create: openCreate,
      carnet: openCarnet,
    },
    close: {
      detail: () => setDetailModalOpen(false),
      edit: () => setEditModalOpen(false),
      delete: () => setDeleteModalOpen(false),
      create: () => setCreateModalOpen(false),
      carnet: () => setCarnetModalOpen(false),
      all: closeAll,
    },
  };
}
