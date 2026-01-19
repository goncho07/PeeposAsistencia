import React from 'react';
import { useFetchParents } from '../../hooks/useFetchParents';
import { EntitySearchList } from '../shared/EntitySearchList';
import { Spinner } from '@/app/components/ui/base';
import { Users } from 'lucide-react';
import { Parent } from '@/lib/api/users';

interface ParentAssignmentFormProps {
  selectedParentIds: number[];
  onToggleParent: (id: number) => void;
}

export function ParentAssignmentForm({
  selectedParentIds,
  onToggleParent,
}: ParentAssignmentFormProps) {
  const { parents, loading, error } = useFetchParents();

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-danger/10 border border-danger text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary dark:text-primary-light" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Asignar Apoderados
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <EntitySearchList<Parent>
          entities={parents}
          selectedIds={selectedParentIds}
          onToggle={onToggleParent}
          searchPlaceholder="Buscar apoderado por nombre o documento..."
          emptyMessage="No se encontraron apoderados"
          getEntityId={(parent) => parent.id}
          searchFilter={(parent, query) => {
            const fullName = parent.full_name?.toLowerCase() || '';
            const docNumber = parent.document_number?.toLowerCase() || '';
            return fullName.includes(query) || docNumber.includes(query);
          }}
          renderItem={(parent, isSelected) => (
            <div>
              <p className="font-medium text-text-primary dark:text-text-primary-dark">
                {parent.full_name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {parent.document_type?.toUpperCase()}: {parent.document_number}
                </p>
                {parent.phone_number && (
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    TELÉFONO: {parent.phone_number}
                  </p>
                )}
              </div>
            </div>
          )}
        />
      )}

      {selectedParentIds.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary dark:border-primary-light">
          <p className="text-sm text-primary dark:text-primary-light">
            <strong>{selectedParentIds.length}</strong> apoderado{selectedParentIds.length !== 1 ? 's' : ''} seleccionado{selectedParentIds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
