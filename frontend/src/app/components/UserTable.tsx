'use client';
import { motion } from 'framer-motion';
import { MoreVertical, Eye, Edit, Trash2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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
}

const getEntityTypeLabel = (type: EntityType): string => {
    const labels = {
        student: 'Estudiante',
        teacher: 'Docente',
        parent: 'Apoderado',
        user: 'Administrativo'
    };
    return labels[type];
};

const getEntityIdentifier = (entity: Entity, type: EntityType): string => {
    if (type === 'student') return (entity as any).student_code;
    if (type === 'teacher' || type === 'user') return (entity as any).dni;
    if (type === 'parent') return (entity as any).document_number;
    return '—';
};

const getEntityLevel = (entity: Entity, type: EntityType): string => {
    if (type === 'student') {
        const classroom = (entity as any).classroom;
        return classroom?.level || '—';
    }
    if (type === 'teacher') return (entity as any).level || '—';
    return '—';
};

const getEntitySection = (entity: Entity, type: EntityType): string => {
    if (type === 'student') {
        const classroom = (entity as any).classroom;
        if (!classroom) return '—';

        const isInicial = classroom.level === 'INICIAL';
        return isInicial
            ? `${classroom.grade} AÑOS ${classroom.section}`
            : `${classroom.grade}° ${classroom.section}`;
    }
    if (type === 'teacher') {
        const classrooms = (entity as any).classrooms;
        return classrooms && classrooms.length > 0
            ? `${classrooms[0].grade}° ${classrooms[0].section}`
            : '—';
    }
    return '—';
};

const getEntityPhoto = (entity: Entity, type: EntityType): string | null => {
    if (type === 'student') return (entity as any).photo_url;
    if (type === 'user') return (entity as any).avatar_url;
    return null;
};

export function UserTable({
    entities,
    entityType,
    onView,
    onEdit,
    onDelete,
    currentPage,
    totalPages,
    onPageChange
}: UserTableProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

    const toggleMenu = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="overflow-x-hidden">
            <div className="card overflow-hidden">
                <div className="overflow-x-auto min-w-0">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 2%, transparent)' }}>
                                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', width: '35%' }}>
                                    Usuario
                                </th>
                                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', width: '20%' }}>
                                    Tipo
                                </th>
                                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', width: '20%' }}>
                                    Nivel
                                </th>
                                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', width: '20%' }}>
                                    Sección
                                </th>
                                <th className="text-center px-3 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', width: '5%' }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {entities.map((entity) => {
                                const photo = getEntityPhoto(entity, entityType);
                                const isHovered = hoveredRowId === entity.id;
                                return (
                                    <motion.tr
                                        key={entity.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => onView(entity)}
                                        onMouseEnter={() => setHoveredRowId(entity.id)}
                                        onMouseLeave={() => setHoveredRowId(null)}
                                        className="user-table-row cursor-pointer"
                                    >
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                                                    {photo ? (
                                                        <img src={photo} alt={entity.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-sm truncate transition-colors" style={{
                                                        color: isHovered ? 'var(--color-primary)' : 'var(--color-text-primary)'
                                                    }}>
                                                        {entity.full_name}
                                                    </span>
                                                    <span className="text-xs truncate transition-colors" style={{
                                                        color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                                                    }}>
                                                        {getEntityIdentifier(entity, entityType)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap inline-block" style={{
                                                backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                                color: 'var(--color-primary)'
                                            }}>
                                                {getEntityTypeLabel(entityType)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-sm transition-colors" style={{
                                                color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                                            }}>
                                                {getEntityLevel(entity, entityType)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="text-sm whitespace-nowrap transition-colors" style={{
                                                color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                                            }}>
                                                {getEntitySection(entity, entityType)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 relative text-center">
                                            <button
                                                onClick={(e) => toggleMenu(entity.id, e)}
                                                className="user-table-action-btn inline-flex"
                                            >
                                                <MoreVertical size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                            </button>

                                            {openMenuId === entity.id && (
                                                <div className="user-table-menu right-8 top-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onView(entity);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="user-table-menu-item"
                                                    >
                                                        <Eye size={16} /> Ver
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(entity);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="user-table-menu-item"
                                                    >
                                                        <Edit size={16} /> Editar
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(entity);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="user-table-menu-item-danger"
                                                    >
                                                        <Trash2 size={16} /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {entities.length === 0 && (
                    <div className="text-center py-16">
                        <p style={{ color: 'var(--color-text-secondary)' }}>No se encontraron resultados</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
