'use client';
import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { getStorageUrl } from '@/lib/axios';
import { User as UserIcon, GraduationCap, Calendar, Mail, Phone, Users, IdCard, Building2, Award, Heart, Clock, MapPin, Briefcase, Star } from 'lucide-react';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    entity: Entity | null;
    entityType: EntityType;
}

type TabType = 'info' | 'academic' | 'activity';

export function UserDetailModal({ isOpen, onClose, entity, entityType }: UserDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('info');

    if (!entity) return null;

    const getTabs = (): { id: TabType; label: string }[] => {
        const baseTabs: { id: TabType; label: string }[] = [
            { id: 'info', label: 'Información' },
        ];

        if (entityType !== 'parent') {
            baseTabs.push({ id: 'academic', label: 'Académico' });
        }

        if (entityType === 'user') {
            baseTabs.push({ id: 'activity', label: 'Actividad' });
        }

        return baseTabs;
    };

    const tabs = getTabs();

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            ACTIVO: { label: 'Activo', className: 'badge badge-success' },
            INACTIVO: { label: 'Inactivo', className: 'badge badge-danger' },
            MATRICULADO: { label: 'Matriculado', className: 'badge badge-success' },
            RETIRADO: { label: 'Retirado', className: 'badge badge-danger' },
            TRASLADADO: { label: 'Trasladado', className: 'badge badge-warning' },
            EGRESADO: { label: 'Egresado', className: 'badge badge-primary' },
            LICENCIA: { label: 'Licencia', className: 'badge badge-warning' },
            CESADO: { label: 'Cesado', className: 'badge badge-danger' },
        };
        const config = statusMap[status] || { label: status, className: 'badge' };
        return <span className={config.className}>{config.label}</span>;
    };

    const getPhotoUrl = () => {
        if (entityType === 'student') {
            return (entity as Student).photo_url ? getStorageUrl((entity as Student).photo_url) : null;
        }
        if (entityType === 'user') {
            return (entity as User).photo_url ? getStorageUrl((entity as User).photo_url) : null;
        }
        return null;
    };

    const getInitials = () => {
        const names = entity.full_name.split(' ');
        return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    const getSubtitle = () => {
        const student = entityType === 'student' ? entity as Student : null;
        const teacher = entityType === 'teacher' ? entity as Teacher : null;
        const parent = entityType === 'parent' ? entity as Parent : null;
        const user = entityType === 'user' ? entity as User : null;

        if (student) return `DNI ${student.document_number}`;
        if (teacher) return `DNI ${teacher.dni}`;
        if (parent) return `${parent.document_type} ${parent.document_number}`;
        if (user) return `DNI ${user.dni}`;
        return '';
    };

    const getRoleInfo = () => {
        const student = entityType === 'student' ? entity as Student : null;
        const teacher = entityType === 'teacher' ? entity as Teacher : null;

        if (student && student.classroom) {
            return student.classroom.full_name;
        }
        if (teacher) {
            return teacher.level;
        }
        return entityType === 'parent' ? 'Apoderado' : 'Administrador';
    };

    const renderInfoTab = () => {
        const student = entityType === 'student' ? entity as Student : null;
        const teacher = entityType === 'teacher' ? entity as Teacher : null;
        const parent = entityType === 'parent' ? entity as Parent : null;
        const user = entityType === 'user' ? entity as User : null;

        return (
            <div className="space-y-4">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <UserIcon className="w-5 h-5" />
                        <h3>Información</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {student && (
                            <>
                                <div>
                                    <div className="detail-label">
                                        Código
                                    </div>
                                    <div className="detail-value">{student.student_code}</div>
                                </div>
                                <div>
                                    <div className="detail-label">
                                        Nacimiento
                                    </div>
                                    <div className="detail-value">
                                        {new Date(student.birth_date).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="detail-label">
                                        Edad
                                    </div>
                                    <div className="detail-value">{student.age} años</div>
                                </div>
                                <div>
                                    <div className="detail-label">
                                        Genero
                                    </div>
                                    <div className="detail-value">{student.gender}</div>
                                </div>
                                <div>
                                    <div className="detail-label">
                                        Estado
                                    </div>
                                    <div className="detail-value">{getStatusBadge(student.enrollment_status)}</div>
                                </div>
                            </>
                        )}

                        {teacher && (
                            <>
                                <div>
                                    <div className="detail-label">
                                        <MapPin size={14} />
                                        Nivel
                                    </div>
                                    <div className="detail-value">{teacher.level}</div>
                                </div>
                                {teacher.email && (
                                    <div>
                                        <div className="detail-label">
                                            <Mail size={14} />
                                            Email
                                        </div>
                                        <div className="detail-value">{teacher.email}</div>
                                    </div>
                                )}
                                {teacher.phone_number && (
                                    <div>
                                        <div className="detail-label">
                                            <Phone size={14} />
                                            Teléfono
                                        </div>
                                        <div className="detail-value">{teacher.phone_number}</div>
                                    </div>
                                )}
                                {teacher.area && (
                                    <div className="col-span-2">
                                        <div className="detail-label">
                                            <Briefcase size={14} />
                                            Área
                                        </div>
                                        <div className="detail-value">{teacher.area}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="detail-label">
                                        Estado
                                    </div>
                                    <div className="detail-value">{getStatusBadge(teacher.status)}</div>
                                </div>
                            </>
                        )}

                        {parent && (
                            <>
                                {parent.email && (
                                    <div>
                                        <div className="detail-label">
                                            <Mail size={14} />
                                            Email
                                        </div>
                                        <div className="detail-value text-xs">{parent.email}</div>
                                    </div>
                                )}
                                {parent.phone_number && (
                                    <div>
                                        <div className="detail-label">
                                            <Phone size={14} />
                                            Teléfono
                                        </div>
                                        <div className="detail-value">{parent.phone_number}</div>
                                    </div>
                                )}
                            </>
                        )}

                        {user && (
                            <>
                                {user.email && (
                                    <div>
                                        <div className="detail-label">
                                            Email
                                        </div>
                                        <div className="detail-value text-xs">{user.email}</div>
                                    </div>
                                )}
                                {user.phone_number && (
                                    <div>
                                        <div className="detail-label">
                                            Teléfono
                                        </div>
                                        <div className="detail-value">{user.phone_number}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="detail-label">
                                        Estado
                                    </div>
                                    <div className="detail-value">{getStatusBadge(user.status)}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {student && student.parents && student.parents.length > 0 && (
                    <div className="detail-card">
                        <div className="detail-card-header">
                            <Heart className="w-5 h-5" />
                            <h3>Apoderados</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {student.parents.map((parentData: any, index: number) => (
                                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                            {parentData.full_name}
                                        </div>
                                        {parentData.relationship.is_primary_contact && (
                                            <span className="badge badge-primary text-xs">Principal</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                        <div>
                                            <div className="detail-label">
                                                <Heart size={14} />
                                                Relación
                                            </div>
                                            <div className="detail-value text-xs">{parentData.relationship.type}</div>
                                        </div>
                                        {parentData.phone_number && (
                                            <div>
                                                <div className="detail-label">
                                                    <Phone size={14} />
                                                    Teléfono
                                                </div>
                                                <div className="detail-value text-xs">{parentData.phone_number}</div>
                                            </div>
                                        )}
                                        {parentData.email && (
                                            <div className="col-span-2">
                                                <div className="detail-label">
                                                    <Mail size={14} />
                                                    Email
                                                </div>
                                                <div className="detail-value text-xs">{parentData.email}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {parent && parent.students && parent.students.length > 0 && (
                    <div className="detail-card">
                        <div className="detail-card-header">
                            <Users className="w-5 h-5" />
                            <h3>Hijos</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {parent.students.map((studentData: any, index: number) => (
                                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                            {studentData.full_name}
                                        </div>
                                        {getStatusBadge(studentData.enrollment_status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                        <div>
                                            <div className="detail-label">
                                                <Building2 size={14} />
                                                Aula
                                            </div>
                                            <div className="detail-value text-xs">{studentData.classroom?.full_name || 'Sin aula'}</div>
                                        </div>
                                        <div>
                                            <div className="detail-label">
                                                <IdCard size={14} />
                                                Código
                                            </div>
                                            <div className="detail-value text-xs">{studentData.student_code}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAcademicTab = () => {
        if (entityType === 'student') {
            const student = entity as Student;
            return (
                <div className="detail-card">
                    <div className="detail-card-header">
                        <GraduationCap className="w-5 h-5" />
                        <h3>Información Académica</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <div className="detail-label">
                                Aula
                            </div>
                            <div className="detail-value">{student.classroom?.full_name || 'No asignado'}</div>
                        </div>
                        <div>
                            <div className="detail-label">
                                Nivel
                            </div>
                            <div className="detail-value">{student.classroom?.level || '-'}</div>
                        </div>
                        <div>
                            <div className="detail-label">
                                Turno
                            </div>
                            <div className="detail-value">{student.classroom?.shift || '-'}</div>
                        </div>
                        {student.classroom?.teacher && (
                            <div>
                                <div className="detail-label">
                                    Tutor(a)
                                </div>
                                <div className="detail-value">{student.classroom.teacher.full_name}</div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (entityType === 'teacher') {
            const teacher = entity as Teacher;
            return (
                <div className="space-y-4">
                    <div className="detail-card">
                        <div className="detail-card-header">
                            <Building2 className="w-5 h-5" />
                            <h3>Información Profesional</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <div className="detail-label">
                                    Nivel
                                </div>
                                <div className="detail-value">{teacher.level}</div>
                            </div>
                            {teacher.area && (
                                <div>
                                    <div className="detail-label">
                                        Área
                                    </div>
                                    <div className="detail-value">{teacher.area}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {teacher.classrooms && teacher.classrooms.length > 0 && (
                        <div className="detail-card">
                            <div className="detail-card-header">
                                <Users className="w-5 h-5" />
                                <h3>Aulas Asignadas ({teacher.classrooms.length})</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {teacher.classrooms.map((classroom: any) => (
                                    <div key={classroom.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                        <div className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                            {classroom.full_name}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                            <div>
                                                <div className="detail-label">
                                                    Nivel
                                                </div>
                                                <div className="detail-value text-xs">{classroom.level}</div>
                                            </div>
                                            <div>
                                                <div className="detail-label">
                                                    Turno
                                                </div>
                                                <div className="detail-value text-xs">{classroom.shift}</div>
                                            </div>
                                            {classroom.students_count !== undefined && (
                                                <div className="col-span-2">
                                                    <div className="detail-label">
                                                        <Users size={14} />
                                                        Estudiantes
                                                    </div>
                                                    <div className="detail-value text-xs">{classroom.students_count}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (entityType === 'user') {
            const user = entity as User;
            return (
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Award className="w-5 h-5" />
                        <h3>Información del Sistema</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <div className="detail-label">
                                Rol
                            </div>
                            <div className="detail-value">{user.role}</div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderActivityTab = () => {
        const user = entityType === 'user' ? entity as User : null;

        return (
            <div className="detail-card">
                <div className="detail-card-header">
                    <Calendar className="w-5 h-5" />
                    <h3>Actividad Reciente</h3>
                </div>
                {user?.last_login_at ? (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                        <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            Último acceso
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {new Date(user.last_login_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                        {user.last_login_ip && (
                            <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                IP: {user.last_login_ip}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-secondary)' }}>
                        Sin actividad registrada
                    </p>
                )}
            </div>
        );
    };

    const getModalTitle = () => {
        const typeLabels: Record<EntityType, string> = {
            student: 'Detalles del Estudiante',
            teacher: 'Detalles del Docente',
            parent: 'Detalles del Apoderado',
            user: 'Detalles del Administrador',
        };
        return typeLabels[entityType];
    };

    const photoUrl = getPhotoUrl();

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="md">
            <div className="detail-modal-header">
                <div className="detail-modal-avatar-container">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={entity.full_name}
                            className="detail-modal-avatar"
                        />
                    ) : (
                        <div className="detail-modal-avatar-fallback">
                            <span>{getInitials()}</span>
                        </div>
                    )}
                </div>
                <div className="detail-modal-info">
                    <h2 className="detail-modal-name">{entity.full_name}</h2>
                    <div className="detail-modal-subtitle">
                        {getRoleInfo()} • {getSubtitle()}
                    </div>
                </div>
            </div>

            <div className="tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>
                {activeTab === 'info' && renderInfoTab()}
                {activeTab === 'academic' && renderAcademicTab()}
                {activeTab === 'activity' && renderActivityTab()}
            </div>
        </BaseModal>
    );
}
