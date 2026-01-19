'use client';
import { useState, MouseEvent } from 'react';
import { Pencil, Trash2, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Entity, EntityType } from '@/lib/api/users';

interface UserTableProps {
  entities: Entity[];
  entityType: EntityType;
  onView: (entity: Entity) => void;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const COLUMN_LABELS: Record<EntityType, string> = {
  student: 'Nivel / Aula',
  teacher: 'Nivel / Área',
  parent: 'Estudiantes',
  user: 'Rol / Estado',
};

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

const getEntityIdentifier = (entity: Entity, type: EntityType): string => {
  if (type === 'student') return (entity as any).student_code || '—';
  if (type === 'teacher' || type === 'user') return (entity as any).dni || '—';
  if (type === 'parent') return (entity as any).document_number || '—';
  return '—';
};

function Avatar({ entity }: { entity: Entity }) {
  const photo = (entity as any).photo_url;
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-background border-2 border-border shrink-0">
      {photo ? (
        <img src={photo} alt={entity.full_name} className="w-full h-full object-cover" />
      ) : (
        <User className="w-5 h-5 text-text-secondary" />
      )}
    </div>
  );
}

function EntityLevelInfo({ entity, type }: { entity: Entity; type: EntityType }) {
  if (type === 'student') {
    const classroom = (entity as any).classroom;
    if (!classroom) return <span className="text-xs text-text-secondary">—</span>;

    const sectionText =
      classroom.level === 'INICIAL'
        ? `${classroom.grade} AÑOS ${classroom.section}`
        : `${classroom.grade}° ${classroom.section}`;

    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-text-primary">{classroom.level}</span>
        <span className="text-xs text-text-secondary">{sectionText}</span>
      </div>
    );
  }

  if (type === 'teacher') {
    const teacher = entity as any;
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-text-primary">{teacher.level || '—'}</span>
        <span className="text-xs uppercase text-text-secondary">{teacher.area || 'General'}</span>
      </div>
    );
  }

  if (type === 'parent') {
    const parent = entity as any;
    const studentsCount = parent.students?.length || 0;
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-text-primary">
          {studentsCount} estudiante{studentsCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-text-secondary">{parent.phone_number || '—'}</span>
      </div>
    );
  }

  if (type === 'user') {
    const user = entity as any;
    return (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-text-primary">{user.role || '—'}</span>
        <span className="text-xs text-text-secondary">{user.status || '—'}</span>
      </div>
    );
  }

  return <span className="text-xs text-text-secondary">—</span>;
}

function ActionButton({
  onClick,
  icon: Icon,
  title,
  variant = 'primary',
}: {
  onClick: (e: MouseEvent) => void;
  icon: typeof Eye;
  title: string;
  variant?: 'primary' | 'danger';
}) {
  const colorClasses = variant === 'danger'
    ? 'hover:bg-danger/10 text-danger'
    : 'hover:bg-primary/10 text-primary';

  return (
    <button
      onClick={(e) => {
        stopPropagation(e);
        onClick(e);
      }}
      className={`p-2 rounded-lg transition-colors ${colorClasses}`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface rounded-xl p-16 text-center border border-border">
      <p className="text-text-secondary">No se encontraron resultados</p>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <span className="text-sm text-text-secondary">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full flex-1">
      <div className="block lg:hidden space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-card animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-card animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-card animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-card animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left px-4 py-3 w-[50%]">
                  <div className="h-3 w-16 bg-card animate-pulse rounded" />
                </th>
                <th className="text-left px-4 py-3 w-[35%]">
                  <div className="h-3 w-20 bg-card animate-pulse rounded" />
                </th>
                <th className="text-center px-4 py-3 w-[15%]">
                  <div className="h-3 w-16 bg-card animate-pulse rounded mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-card animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-card animate-pulse rounded" />
                        <div className="h-3 w-24 bg-card animate-pulse rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-card animate-pulse rounded" />
                      <div className="h-3 w-16 bg-card animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-8 h-8 bg-card animate-pulse rounded-lg" />
                      <div className="w-8 h-8 bg-card animate-pulse rounded-lg" />
                      <div className="w-8 h-8 bg-card animate-pulse rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function UserTable({
  entities,
  entityType,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: UserTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full flex-1">
      <div className="block lg:hidden">
        {entities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {entities.map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => onView(entity)}
                  className="bg-surface rounded-xl p-4 border border-border hover:border-primary transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <Avatar entity={entity} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-text-primary truncate">
                          {entity.full_name}
                        </h3>
                        <p className="text-xs text-text-secondary mb-1">
                          {getEntityIdentifier(entity, entityType)}
                        </p>
                        <EntityLevelInfo entity={entity} type={entityType} />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <ActionButton
                        onClick={() => onEdit(entity)}
                        icon={Pencil}
                        title="Editar"
                      />
                      <ActionButton
                        onClick={() => onDelete(entity)}
                        icon={Trash2}
                        title="Eliminar"
                        variant="danger"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-primary/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-[50%]">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-[35%]">
                    {COLUMN_LABELS[entityType]}
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary w-[15%]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {entities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-16 text-center text-text-secondary">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  entities.map((entity) => (
                      <tr
                        key={entity.id}
                        onMouseEnter={() => setHoveredRowId(entity.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        onClick={() => onView(entity)}
                        className={`
                          border-b border-border last:border-0
                          cursor-pointer transition-colors duration-150
                          ${hoveredRowId === entity.id ? 'bg-primary/5' : ''}
                        `}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar entity={entity} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-text-primary truncate">
                                {entity.full_name}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {getEntityIdentifier(entity, entityType)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <EntityLevelInfo entity={entity} type={entityType} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton
                              onClick={() => onView(entity)}
                              icon={Eye}
                              title="Ver detalles"
                            />
                            <ActionButton
                              onClick={() => onEdit(entity)}
                              icon={Pencil}
                              title="Editar"
                            />
                            <ActionButton
                              onClick={() => onDelete(entity)}
                              icon={Trash2}
                              title="Eliminar"
                              variant="danger"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
