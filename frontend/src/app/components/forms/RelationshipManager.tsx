import React, { useMemo } from 'react';
import { Users, Search, Plus, Trash2, AlertCircle } from 'lucide-react';
import FormSelect from './FormSelect';
import FormSection from './FormSection';
import { RELATIONSHIP_TYPES } from '@/app/config/formFieldsConfig';
import type { Relationship } from '@/app/hooks';

interface RelationshipManagerProps {
  relations: Relationship[];
  availableEntities: any[];
  entityType: 'parent' | 'student';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof Relationship, value: any) => void;
  canAddMore: boolean;
  maxCount?: number;
  errors?: Record<string, string>;
}

const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  relations,
  availableEntities,
  entityType,
  searchQuery,
  onSearchChange,
  onAdd,
  onRemove,
  onUpdate,
  canAddMore,
  maxCount = 5,
  errors = {},
}) => {
  const title = entityType === 'parent' ? 'Apoderados' : 'Estudiantes';
  const entityLabel = entityType === 'parent' ? 'apoderado' : 'estudiante';
  const idField = entityType === 'parent' ? 'parent_id' : 'student_id';

  // Filtrar entidades disponibles según búsqueda
  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return availableEntities;

    const query = searchQuery.toLowerCase();
    return availableEntities.filter((entity: any) =>
      entity.full_name?.toLowerCase().includes(query) ||
      entity.document_number?.toLowerCase().includes(query) ||
      entity.student_code?.toLowerCase().includes(query)
    );
  }, [availableEntities, searchQuery]);

  return (
    <FormSection title={title} icon={<Users size={18} />}>
      {/* Buscador */}
      {availableEntities.length > 0 && (
        <div className="relative mb-2 input-with-icon">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none"
            style={{ color: 'var(--color-text-secondary)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            className="input text-sm"
          />
        </div>
      )}

      {/* Lista de relaciones */}
      {relations.map((relation, index) => {
        const entityId = relation[idField];
        const selectedEntity = availableEntities.find((e: any) => e.id === entityId);

        return (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">
                {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Selector de entidad */}
            <FormSelect
              label={`Seleccionar ${entityLabel}`}
              name={`${idField}_${index}`}
              value={entityId || ''}
              onChange={(e) => onUpdate(index, idField as keyof Relationship, parseInt(e.target.value) || 0)}
              options={filteredEntities.map((entity: any) => ({
                value: entity.id,
                label: entityType === 'student'
                  ? `${entity.full_name} - ${entity.student_code}`
                  : `${entity.full_name} - ${entity.document_number}`,
              }))}
              placeholder={`Seleccionar ${entityLabel}`}
              required
              error={errors[`relations.${index}.${idField}`]}
              emptyMessage={searchQuery ? 'No se encontraron resultados' : undefined}
            />

            {filteredEntities.length > 0 && searchQuery && (
              <p className="text-xs mt-1 opacity-60">
                {filteredEntities.length} de {availableEntities.length} {entityLabel}s
              </p>
            )}

            {/* Tipo de relación */}
            <FormSelect
              label="Tipo de Relación"
              name={`relationship_type_${index}`}
              value={relation.relationship_type || ''}
              onChange={(e) => onUpdate(index, 'relationship_type', e.target.value)}
              options={RELATIONSHIP_TYPES}
              placeholder="Seleccionar relación"
              required
              error={errors[`relations.${index}.relationship_type`]}
            />

            {/* Etiqueta personalizada si es "OTRO" */}
            {relation.relationship_type === 'OTRO' && (
              <div className="form-group">
                <label className="form-label text-sm">
                  Especificar Relación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={relation.custom_relationship_label || ''}
                  onChange={(e) => onUpdate(index, 'custom_relationship_label', e.target.value)}
                  placeholder="Ej: Primo, Tío abuelo, etc."
                  className="input text-sm"
                  required
                />
              </div>
            )}

            {/* Opciones adicionales */}
            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={relation.is_primary_contact}
                  onChange={(e) => onUpdate(index, 'is_primary_contact', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Contacto Principal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={relation.receives_notifications}
                  onChange={(e) => onUpdate(index, 'receives_notifications', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Recibir Notificaciones</span>
              </label>
            </div>
          </div>
        );
      })}

      {/* Botón para agregar más */}
      {canAddMore && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full py-2 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          Agregar {entityLabel}
        </button>
      )}

      {/* Mensaje cuando se alcanza el límite */}
      {!canAddMore && (
        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span>Máximo {maxCount} {entityLabel}s permitidos</span>
        </div>
      )}

      {/* Advertencia cuando no hay relaciones */}
      {relations.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span>Haga clic en "Agregar {entityLabel}" para comenzar</span>
        </div>
      )}
    </FormSection>
  );
};

export default RelationshipManager;
