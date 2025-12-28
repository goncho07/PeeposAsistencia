'use client';
import { useState, useEffect, useMemo } from 'react';
import { BaseModal } from './BaseModal';
import { Entity, EntityType, Student, Teacher, Parent, User, usersService } from '@/lib/api/users';
import { Save, IdCard, UserCircle2, Building2, BookOpen, Phone, Award, Info, Heart, Users, Plus, Trash2, AlertCircle, Search } from 'lucide-react';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entity: Entity | null;
    entityType: EntityType;
}

interface Classroom {
    id: number;
    full_name: string;
    level: string;
    grade: number;
    section: string;
    shift: string;
    status: string;
}

type EditTabType = 'personal' | 'academic' | 'contact' | 'relations';

export function UserEditModal({ isOpen, onClose, onSuccess, entity, entityType }: UserEditModalProps) {
    const [activeTab, setActiveTab] = useState<EditTabType>('personal');
    const [changedFields, setChangedFields] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [availableParents, setAvailableParents] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [parentSearchQuery, setParentSearchQuery] = useState('');
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setChangedFields({});
            setError('');
            setParentSearchQuery('');
            setStudentSearchQuery('');

            if (entityType === 'student') {
                fetchClassrooms();
                fetchParents();
            }

            if (entityType === 'parent') {
                fetchStudents();
            }
        }
    }, [isOpen, entityType]);

    const fetchClassrooms = async () => {
        try {
            const data = await usersService.getClassrooms();
            setClassrooms(data || []);
        } catch (err) {
            console.error('Error fetching classrooms:', err);
        }
    };

    const fetchParents = async () => {
        try {
            const data = await usersService.getParents();
            setAvailableParents(data || []);
        } catch (err) {
            console.error('Error fetching parents:', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await usersService.getStudents();
            setAvailableStudents(data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };
    
    const filteredParents = useMemo(() => {
        if (!parentSearchQuery.trim()) return availableParents;
        const query = parentSearchQuery.toLowerCase();
        return availableParents.filter((parent) => {
            const fullName = parent.full_name?.toLowerCase() || '';
            const documentNumber = parent.document_number?.toLowerCase() || '';
            return fullName.includes(query) || documentNumber.includes(query);
        });
    }, [availableParents, parentSearchQuery]);

    const filteredStudents = useMemo(() => {
        if (!studentSearchQuery.trim()) return availableStudents;
        const query = studentSearchQuery.toLowerCase();
        return availableStudents.filter((student: any) => {
            const fullName = student.full_name?.toLowerCase() || '';
            const studentCode = student.student_code?.toLowerCase() || '';
            const documentNumber = student.document_number?.toLowerCase() || '';
            return fullName.includes(query) || studentCode.includes(query) || documentNumber.includes(query);
        });
    }, [availableStudents, studentSearchQuery]);

    const addParentRelation = () => {
        const currentParents = changedFields.parents || (entity as Student).parents || [];

        const normalizedParents = currentParents.map((p: any) => ({
            parent_id: p.parent_id || p.id,
            relationship_type: p.relationship_type || p.relationship?.type || 'PADRE',
            custom_relationship_label: p.custom_relationship_label || p.relationship?.custom_label || '',
            is_primary_contact: p.is_primary_contact ?? p.relationship?.is_primary_contact ?? false,
            receives_notifications: p.receives_notifications ?? p.relationship?.receives_notifications ?? true,
        }));

        const newParents = [
            ...normalizedParents,
            {
                parent_id: '',
                relationship_type: 'PADRE',
                custom_relationship_label: '',
                is_primary_contact: normalizedParents.length === 0,
                receives_notifications: true,
            }
        ];
        setChangedFields((prev: any) => ({ ...prev, parents: newParents }));
    };

    const removeParentRelation = (index: number) => {
        const currentParents = changedFields.parents || (entity as Student).parents || [];

        const normalizedParents = currentParents.map((p: any) => ({
            parent_id: p.parent_id || p.id,
            relationship_type: p.relationship_type || p.relationship?.type || 'PADRE',
            custom_relationship_label: p.custom_relationship_label || p.relationship?.custom_label || '',
            is_primary_contact: p.is_primary_contact ?? p.relationship?.is_primary_contact ?? false,
            receives_notifications: p.receives_notifications ?? p.relationship?.receives_notifications ?? true,
        }));

        const newParents = normalizedParents.filter((_: any, i: number) => i !== index);

        const originalParents = (entity as Student).parents || [];
        if (newParents.length === originalParents.length) {
            setChangedFields((prev: any) => {
                const updated = { ...prev };
                delete updated.parents;
                return updated;
            });
        } else {
            setChangedFields((prev: any) => ({ ...prev, parents: newParents }));
        }
    };

    const updateParentRelation = (index: number, field: string, value: any) => {
        const currentParents = changedFields.parents || (entity as Student).parents || [];

        const normalizedParents = currentParents.map((p: any) => ({
            parent_id: p.parent_id || p.id,
            relationship_type: p.relationship_type || p.relationship?.type || 'PADRE',
            custom_relationship_label: p.custom_relationship_label || p.relationship?.custom_label || '',
            is_primary_contact: p.is_primary_contact ?? p.relationship?.is_primary_contact ?? false,
            receives_notifications: p.receives_notifications ?? p.relationship?.receives_notifications ?? true,
        }));

        normalizedParents[index] = { ...normalizedParents[index], [field]: value };

        setChangedFields((prev: any) => ({ ...prev, parents: normalizedParents }));
    };

    const addStudentRelation = () => {
        const currentStudents = changedFields.students || (entity as Parent).students || [];

        const normalizedStudents = currentStudents.map((s: any) => ({
            student_id: s.student_id || s.id,
            relationship_type: s.relationship_type || s.relationship?.type || 'PADRE',
            custom_relationship_label: s.custom_relationship_label || s.relationship?.custom_label || '',
            is_primary_contact: s.is_primary_contact ?? s.relationship?.is_primary_contact ?? false,
            receives_notifications: s.receives_notifications ?? s.relationship?.receives_notifications ?? true,
        }));

        const newStudents = [
            ...normalizedStudents,
            {
                student_id: '',
                relationship_type: 'PADRE',
                custom_relationship_label: '',
                is_primary_contact: normalizedStudents.length === 0,
                receives_notifications: true,
            }
        ];
        setChangedFields((prev: any) => ({ ...prev, students: newStudents }));
    };

    const removeStudentRelation = (index: number) => {
        const currentStudents = changedFields.students || (entity as Parent).students || [];

        const normalizedStudents = currentStudents.map((s: any) => ({
            student_id: s.student_id || s.id,
            relationship_type: s.relationship_type || s.relationship?.type || 'PADRE',
            custom_relationship_label: s.custom_relationship_label || s.relationship?.custom_label || '',
            is_primary_contact: s.is_primary_contact ?? s.relationship?.is_primary_contact ?? false,
            receives_notifications: s.receives_notifications ?? s.relationship?.receives_notifications ?? true,
        }));

        const newStudents = normalizedStudents.filter((_: any, i: number) => i !== index);
        setChangedFields((prev: any) => ({ ...prev, students: newStudents }));
    };

    const updateStudentRelation = (index: number, field: string, value: any) => {
        const currentStudents = changedFields.students || (entity as Parent).students || [];

        const normalizedStudents = currentStudents.map((s: any) => ({
            student_id: s.student_id || s.id,
            relationship_type: s.relationship_type || s.relationship?.type || 'PADRE',
            custom_relationship_label: s.custom_relationship_label || s.relationship?.custom_label || '',
            is_primary_contact: s.is_primary_contact ?? s.relationship?.is_primary_contact ?? false,
            receives_notifications: s.receives_notifications ?? s.relationship?.receives_notifications ?? true,
        }));

        normalizedStudents[index] = { ...normalizedStudents[index], [field]: value };

        setChangedFields((prev: any) => ({ ...prev, students: normalizedStudents }));
    };

    if (!entity) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(changedFields).length === 0) {
            onClose();
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (entityType === 'student') {
                await usersService.updateStudent(entity.id, changedFields);
            } else if (entityType === 'teacher') {
                await usersService.updateTeacher(entity.id, changedFields);
            } else if (entityType === 'parent') {
                await usersService.updateParent(entity.id, changedFields);
            } else if (entityType === 'user') {
                await usersService.updateUser(entity.id, changedFields);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al actualizar. Verifica los datos ingresados.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (value && value.trim() !== '') {
            setChangedFields((prev: any) => ({ ...prev, [field]: value }));
        } else {
            setChangedFields((prev: any) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const getModalTitle = () => {
        const titles: Record<EntityType, string> = {
            student: 'Editar Estudiante',
            teacher: 'Editar Docente',
            parent: 'Editar Apoderado',
            user: 'Editar Usuario',
        };
        return titles[entityType];
    };

    const getModalIcon = () => {
        const icons: Record<EntityType, any> = {
            student: Building2,
            teacher: BookOpen,
            parent: UserCircle2,
            user: Award,
        };
        const Icon = icons[entityType];
        return <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />;
    };

    const getTabs = (): { id: EditTabType; label: string }[] => {
        if (entityType === 'student') {
            return [
                { id: 'personal', label: 'Personal' },
                { id: 'academic', label: 'Académico' },
                { id: 'relations', label: 'Apoderados' },
            ];
        }
        if (entityType === 'teacher') {
            return [
                { id: 'personal', label: 'Personal' },
                { id: 'academic', label: 'Profesional' },
                { id: 'contact', label: 'Contacto' },
            ];
        }
        if (entityType === 'parent') {
            return [
                { id: 'personal', label: 'Personal' },
                { id: 'contact', label: 'Contacto' },
                { id: 'relations', label: 'Hijos' },
            ];
        }
        if (entityType === 'user') {
            return [
                { id: 'personal', label: 'Personal' },
                { id: 'academic', label: 'Sistema' },
            ];
        }
        return [{ id: 'personal', label: 'Personal' }];
    };

    const tabs = getTabs();

    const renderTabContent = () => {
        if (entityType === 'student') {
            if (activeTab === 'personal') return renderStudentPersonalTab();
            if (activeTab === 'academic') return renderStudentAcademicTab();
            if (activeTab === 'relations') return renderStudentRelationsTab();
        }
        if (entityType === 'teacher') {
            if (activeTab === 'personal') return renderTeacherPersonalTab();
            if (activeTab === 'academic') return renderTeacherProfessionalTab();
            if (activeTab === 'contact') return renderTeacherContactTab();
        }
        if (entityType === 'parent') {
            if (activeTab === 'personal') return renderParentPersonalTab();
            if (activeTab === 'contact') return renderParentContactTab();
            if (activeTab === 'relations') return renderParentRelationsTab();
        }
        if (entityType === 'user') {
            if (activeTab === 'personal') return renderUserPersonalTab();
            if (activeTab === 'academic') return renderUserSystemTab();
        }
        return null;
    };

    const renderStudentPersonalTab = () => {
        const student = entity as Student;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <UserCircle2 className="w-5 h-5" />
                        <h3>Información Personal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="label">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                placeholder={student.full_name}
                                value={changedFields.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.name}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="paternal_surname" className="label">Apellido Paterno</label>
                            <input
                                id="paternal_surname"
                                type="text"
                                placeholder={student.paternal_surname}
                                value={changedFields.paternal_surname || ''}
                                onChange={(e) => handleChange('paternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.paternal_surname}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="maternal_surname" className="label">Apellido Materno</label>
                            <input
                                id="maternal_surname"
                                type="text"
                                placeholder={student.maternal_surname}
                                value={changedFields.maternal_surname || ''}
                                onChange={(e) => handleChange('maternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.maternal_surname}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="gender" className="label">Género</label>
                            <select
                                id="gender"
                                value={changedFields.gender || student.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="select"
                            >
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="birth_date" className="label">Fecha de Nacimiento</label>
                            <input
                                id="birth_date"
                                type="date"
                                value={changedFields.birth_date || student.birth_date?.split('T')[0] || ''}
                                onChange={(e) => handleChange('birth_date', e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="detail-card-header">
                        <IdCard className="w-5 h-5" />
                        <h3>Documentación</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="student_code" className="label">Código de Estudiante</label>
                            <input
                                id="student_code"
                                type="text"
                                placeholder={student.student_code}
                                value={changedFields.student_code || ''}
                                onChange={(e) => handleChange('student_code', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.student_code}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="document_type" className="label">Tipo de Documento</label>
                            <select
                                id="document_type"
                                value={changedFields.document_type || student.document_type}
                                onChange={(e) => handleChange('document_type', e.target.value)}
                                className="select"
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">Carné de Extranjería</option>
                                <option value="PAS">Pasaporte</option>
                                <option value="CI">Cédula de Identidad</option>
                                <option value="PTP">PTP</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="document_number" className="label">Número de Documento</label>
                            <input
                                id="document_number"
                                type="text"
                                placeholder={student.document_number}
                                value={changedFields.document_number || ''}
                                onChange={(e) => handleChange('document_number', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.document_number}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentAcademicTab = () => {
        const student = entity as Student;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Building2 className="w-5 h-5" />
                        <h3>Información Académica</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="classroom_id" className="label">Aula</label>
                            <select
                                id="classroom_id"
                                value={changedFields.classroom_id || student.classroom?.id || ''}
                                onChange={(e) => handleChange('classroom_id', e.target.value)}
                                className="select"
                            >
                                <option value="">Seleccionar aula</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.full_name} - {classroom.shift}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {student.classroom?.full_name || 'Sin aula'}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="enrollment_status" className="label">Estado de Matrícula</label>
                            <select
                                id="enrollment_status"
                                value={changedFields.enrollment_status || student.enrollment_status}
                                onChange={(e) => handleChange('enrollment_status', e.target.value)}
                                className="select"
                            >
                                <option value="MATRICULADO">Matriculado</option>
                                <option value="RETIRADO">Retirado</option>
                                <option value="TRASLADADO">Trasladado</option>
                                <option value="EGRESADO">Egresado</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentRelationsTab = () => {
        const student = entity as Student;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Heart className="w-5 h-5" />
                        <h3>Apoderados</h3>
                        <button
                            type="button"
                            onClick={addParentRelation}
                            disabled={changedFields.parents ? changedFields.parents.length >= 4 : (student.parents?.length || 0) >= 4}
                            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white'
                            }}
                        >
                            <Plus size={16}/>
                            Añadir
                        </button>
                    </div>

                    {(() => {
                        const currentParents = changedFields.parents || student.parents || [];

                        if (currentParents.length === 0) {
                            return (
                                <div className="text-center py-8">
                                    <AlertCircle size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--color-text-secondary)' }} />
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        No hay apoderados asignados. Opcional: puedes añadir apoderados ahora o después.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                {currentParents.map((relation: any, index: number) => (
                                    <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                Apoderado #{index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeParentRelation(index)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-group md:col-span-2">
                                                <label className="label">Apoderado *</label>

                                                <div className="relative mb-2 input-with-icon">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none" style={{ color: 'var(--color-text-secondary)' }} />
                                                    <input
                                                        type="text"
                                                        value={parentSearchQuery}
                                                        onChange={(e) => setParentSearchQuery(e.target.value)}
                                                        placeholder="Buscar por nombre o documento..."
                                                        className="input text-sm"
                                                    />
                                                </div>

                                                <select
                                                    value={relation.parent_id || relation.id || ''}
                                                    onChange={(e) => updateParentRelation(index, 'parent_id', e.target.value)}
                                                    required
                                                    className="select"
                                                >
                                                    <option value="">Seleccionar apoderado</option>
                                                    {filteredParents.length === 0 && parentSearchQuery ? (
                                                        <option value="" disabled>No se encontraron resultados</option>
                                                    ) : (
                                                        filteredParents.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.full_name} - {p.document_number}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>

                                                {filteredParents.length > 0 && (
                                                    <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                                                        {filteredParents.length} de {availableParents.length} apoderados
                                                    </p>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="label">Tipo de Relación *</label>
                                                <select
                                                    value={relation.relationship_type || relation.relationship?.type || 'PADRE'}
                                                    onChange={(e) => updateParentRelation(index, 'relationship_type', e.target.value)}
                                                    required
                                                    className="select"
                                                >
                                                    <option value="PADRE">Padre</option>
                                                    <option value="MADRE">Madre</option>
                                                    <option value="APODERADO">Apoderado</option>
                                                    <option value="ABUELO">Abuelo</option>
                                                    <option value="ABUELA">Abuela</option>
                                                    <option value="TIO">Tío</option>
                                                    <option value="TIA">Tía</option>
                                                    <option value="HERMANO">Hermano</option>
                                                    <option value="HERMANA">Hermana</option>
                                                    <option value="OTRO">Otro</option>
                                                </select>
                                            </div>

                                            {(relation.relationship_type || relation.relationship?.type) === 'OTRO' && (
                                                <div className="form-group md:col-span-2">
                                                    <label className="label">Etiqueta Personalizada</label>
                                                    <input
                                                        type="text"
                                                        value={relation.custom_relationship_label || relation.relationship?.custom_label || ''}
                                                        onChange={(e) => updateParentRelation(index, 'custom_relationship_label', e.target.value)}
                                                        placeholder="Ej: Tío materno, Madrina"
                                                        className="input"
                                                        maxLength={50}
                                                    />
                                                </div>
                                            )}

                                            <div className="md:col-span-2 flex flex-col gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={relation.is_primary_contact ?? relation.relationship?.is_primary_contact ?? false}
                                                        onChange={(e) => updateParentRelation(index, 'is_primary_contact', e.target.checked)}
                                                        className="w-4 h-4 rounded"
                                                        style={{ accentColor: 'var(--color-primary)' }}
                                                    />
                                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                                        Contacto principal
                                                    </span>
                                                </label>

                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={relation.receives_notifications ?? relation.relationship?.receives_notifications ?? true}
                                                        onChange={(e) => updateParentRelation(index, 'receives_notifications', e.target.checked)}
                                                        className="w-4 h-4 rounded"
                                                        style={{ accentColor: 'var(--color-primary)' }}
                                                    />
                                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                                        Recibe notificaciones
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {(() => {
                        const currentParents = changedFields.parents || student.parents || [];
                        if (currentParents.length >= 4) {
                            return (
                                <div className="mt-3 p-3 rounded-lg border" style={{
                                    backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                                    borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                                }}>
                                    <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
                                        Se ha alcanzado el máximo de 4 apoderados permitidos.
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        );
    };

    // ===== TEACHER TABS =====
    const renderTeacherPersonalTab = () => {
        const teacher = entity as Teacher;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <UserCircle2 className="w-5 h-5" />
                        <h3>Información Personal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="label">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                placeholder={teacher.name}
                                value={changedFields.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {teacher.name}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="paternal_surname" className="label">Apellido Paterno</label>
                            <input
                                id="paternal_surname"
                                type="text"
                                placeholder={teacher.paternal_surname}
                                value={changedFields.paternal_surname || ''}
                                onChange={(e) => handleChange('paternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {teacher.paternal_surname}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="maternal_surname" className="label">Apellido Materno</label>
                            <input
                                id="maternal_surname"
                                type="text"
                                placeholder={teacher.maternal_surname}
                                value={changedFields.maternal_surname || ''}
                                onChange={(e) => handleChange('maternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {teacher.maternal_surname}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="dni" className="label">DNI</label>
                            <input
                                id="dni"
                                type="text"
                                placeholder={teacher.dni}
                                value={changedFields.dni || ''}
                                onChange={(e) => handleChange('dni', e.target.value)}
                                maxLength={8}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {teacher.dni}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender" className="label">Género</label>
                            <select
                                id="gender"
                                value={changedFields.gender || teacher.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="select"
                            >
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="birth_date" className="label">Fecha de Nacimiento</label>
                            <input
                                id="birth_date"
                                type="date"
                                value={changedFields.birth_date || teacher.birth_date?.split('T')[0] || ''}
                                onChange={(e) => handleChange('birth_date', e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTeacherProfessionalTab = () => {
        const teacher = entity as Teacher;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <BookOpen className="w-5 h-5" />
                        <h3>Información Profesional</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="level" className="label">Nivel</label>
                            <select
                                id="level"
                                value={changedFields.level || teacher.level}
                                onChange={(e) => handleChange('level', e.target.value)}
                                className="select"
                            >
                                <option value="INICIAL">Inicial</option>
                                <option value="PRIMARIA">Primaria</option>
                                <option value="SECUNDARIA">Secundaria</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="area" className="label">Área</label>
                            <input
                                id="area"
                                type="text"
                                placeholder={teacher.area || 'Ej: Matemáticas'}
                                value={changedFields.area || ''}
                                onChange={(e) => handleChange('area', e.target.value)}
                                className="input"
                            />
                            {teacher.area && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {teacher.area}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="status" className="label">Estado</label>
                        <select
                            id="status"
                            value={changedFields.status || teacher.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="select"
                        >
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                            <option value="LICENCIA">Licencia</option>
                            <option value="CESADO">Cesado</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    const renderTeacherContactTab = () => {
        const teacher = entity as Teacher;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Phone className="w-5 h-5" />
                        <h3>Información de Contacto</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="email" className="label">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder={teacher.email || 'correo@ejemplo.com'}
                                value={changedFields.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="input"
                            />
                            {teacher.email && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {teacher.email}
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone_number" className="label">Teléfono</label>
                            <input
                                id="phone_number"
                                type="tel"
                                placeholder={teacher.phone_number || '987654321'}
                                value={changedFields.phone_number || ''}
                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                className="input"
                            />
                            {teacher.phone_number && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {teacher.phone_number}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ===== PARENT TABS =====
    const renderParentPersonalTab = () => {
        const parent = entity as Parent;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <UserCircle2 className="w-5 h-5" />
                        <h3>Información Personal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="label">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                placeholder={parent.name}
                                value={changedFields.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {parent.name}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="paternal_surname" className="label">Apellido Paterno</label>
                            <input
                                id="paternal_surname"
                                type="text"
                                placeholder={parent.paternal_surname}
                                value={changedFields.paternal_surname || ''}
                                onChange={(e) => handleChange('paternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {parent.paternal_surname}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="maternal_surname" className="label">Apellido Materno</label>
                            <input
                                id="maternal_surname"
                                type="text"
                                placeholder={parent.maternal_surname}
                                value={changedFields.maternal_surname || ''}
                                onChange={(e) => handleChange('maternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {parent.maternal_surname}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="detail-card-header">
                        <IdCard className="w-5 h-5" />
                        <h3>Documentación</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="document_type" className="label">Tipo de Documento</label>
                            <select
                                id="document_type"
                                value={changedFields.document_type || parent.document_type}
                                onChange={(e) => handleChange('document_type', e.target.value)}
                                className="select"
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">Carné de Extranjería</option>
                                <option value="PAS">Pasaporte</option>
                                <option value="CI">Cédula de Identidad</option>
                                <option value="PTP">PTP</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="document_number" className="label">Número de Documento</label>
                            <input
                                id="document_number"
                                type="text"
                                placeholder={parent.document_number}
                                value={changedFields.document_number || ''}
                                onChange={(e) => handleChange('document_number', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {parent.document_number}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderParentContactTab = () => {
        const parent = entity as Parent;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Phone className="w-5 h-5" />
                        <h3>Información de Contacto</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="phone_number" className="label">Teléfono</label>
                            <input
                                id="phone_number"
                                type="tel"
                                placeholder={parent.phone_number || '987654321'}
                                value={changedFields.phone_number || ''}
                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                className="input"
                            />
                            {parent.phone_number && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {parent.phone_number}
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="label">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder={parent.email || 'correo@ejemplo.com'}
                                value={changedFields.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="input"
                            />
                            {parent.email && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {parent.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderParentRelationsTab = () => {
        const parent = entity as Parent;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Users className="w-5 h-5" />
                        <h3>Estudiantes</h3>
                        <button
                            type="button"
                            onClick={addStudentRelation}
                            className="ml-auto px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-white text-sm font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            <Plus size={16} />
                            Agregar Estudiante
                        </button>
                    </div>

                    {(() => {
                        const currentStudents = changedFields.students || parent.students || [];

                        if (currentStudents.length === 0) {
                            return (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-secondary)' }} />
                                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        No hay estudiantes asignados
                                    </p>
                                    <button
                                        type="button"
                                        onClick={addStudentRelation}
                                        className="text-sm font-medium hover:underline"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        Agregar el primer estudiante
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                {currentStudents.length > 0 && (
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none"
                                                style={{ color: 'var(--color-text-secondary)' }} />
                                        <input
                                            type="text"
                                            value={studentSearchQuery}
                                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                                            placeholder="Buscar por nombre, código o DNI..."
                                            className="input pl-10 text-sm"
                                        />
                                    </div>
                                )}

                                {currentStudents.map((relation: any, index: number) => (
                                    <div key={index} className="p-4 rounded-lg border space-y-3" style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderColor: 'var(--color-border)'
                                    }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                Estudiante {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeStudentRelation(index)}
                                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                                style={{ color: 'var(--color-danger)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="form-group">
                                                <label className="label text-sm">Estudiante</label>

                                                <div className="relative mb-2 input-with-icon">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer-events-none" style={{ color: 'var(--color-text-secondary)' }} />
                                                    <input
                                                        type="text"
                                                        value={studentSearchQuery}
                                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                        placeholder="Buscar por nombre, código o aula..."
                                                        className="input text-sm"
                                                    />
                                                </div>

                                                <select
                                                    value={relation.student_id || relation.id || ''}
                                                    onChange={(e) => updateStudentRelation(index, 'student_id', e.target.value)}
                                                    className="select text-sm"
                                                >
                                                    <option value="">Seleccionar estudiante</option>
                                                    {filteredStudents.length === 0 && studentSearchQuery ? (
                                                        <option value="" disabled>No se encontraron resultados</option>
                                                    ) : (
                                                        filteredStudents.map((student: any) => (
                                                            <option key={student.id} value={student.id}>
                                                                {student.full_name} - {student.student_code} - {student.classroom?.full_name || 'Sin aula'}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>

                                                {filteredStudents.length > 0 && (
                                                    <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                                                        {filteredStudents.length} de {availableStudents.length} estudiantes
                                                    </p>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label className="label text-sm">Tipo de Relación</label>
                                                <select
                                                    value={relation.relationship_type || relation.relationship?.type || 'PADRE'}
                                                    onChange={(e) => updateStudentRelation(index, 'relationship_type', e.target.value)}
                                                    className="select text-sm"
                                                >
                                                    <option value="PADRE">Padre</option>
                                                    <option value="MADRE">Madre</option>
                                                    <option value="APODERADO">Apoderado</option>
                                                </select>
                                            </div>

                                            {(relation.relationship_type || relation.relationship?.type) === 'APODERADO' && (
                                                <div className="form-group">
                                                    <label className="label text-sm">Etiqueta Personalizada</label>
                                                    <input
                                                        type="text"
                                                        value={relation.custom_relationship_label || relation.relationship?.custom_label || ''}
                                                        onChange={(e) => updateStudentRelation(index, 'custom_relationship_label', e.target.value)}
                                                        placeholder="Ej: Tío, Abuelo, Tutor"
                                                        className="input text-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={relation.is_primary_contact ?? relation.relationship?.is_primary_contact ?? false}
                                                        onChange={(e) => updateStudentRelation(index, 'is_primary_contact', e.target.checked)}
                                                        className="w-4 h-4 rounded"
                                                        style={{ accentColor: 'var(--color-primary)' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                        Contacto Principal
                                                    </span>
                                                </label>

                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={relation.receives_notifications ?? relation.relationship?.receives_notifications ?? true}
                                                        onChange={(e) => updateStudentRelation(index, 'receives_notifications', e.target.checked)}
                                                        className="w-4 h-4 rounded"
                                                        style={{ accentColor: 'var(--color-primary)' }}
                                                    />
                                                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                        Recibe Notificaciones
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        );
    };

    // ===== USER TABS =====
    const renderUserPersonalTab = () => {
        const user = entity as User;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <UserCircle2 className="w-5 h-5" />
                        <h3>Información Personal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label htmlFor="name" className="label">Nombre</label>
                            <input
                                id="name"
                                type="text"
                                placeholder={user.name}
                                value={changedFields.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {user.name}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="paternal_surname" className="label">Apellido Paterno</label>
                            <input
                                id="paternal_surname"
                                type="text"
                                placeholder={user.paternal_surname}
                                value={changedFields.paternal_surname || ''}
                                onChange={(e) => handleChange('paternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {user.paternal_surname}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="maternal_surname" className="label">Apellido Materno</label>
                            <input
                                id="maternal_surname"
                                type="text"
                                placeholder={user.maternal_surname}
                                value={changedFields.maternal_surname || ''}
                                onChange={(e) => handleChange('maternal_surname', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {user.maternal_surname}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="dni" className="label">DNI</label>
                            <input
                                id="dni"
                                type="text"
                                placeholder={user.dni}
                                value={changedFields.dni || ''}
                                onChange={(e) => handleChange('dni', e.target.value)}
                                maxLength={8}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {user.dni}
                            </p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="label">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder={user.email}
                                value={changedFields.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Actual: {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUserSystemTab = () => {
        const user = entity as User;
        return (
            <div className="space-y-5">
                <div className="detail-card">
                    <div className="detail-card-header">
                        <Award className="w-5 h-5" />
                        <h3>Información del Sistema</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="role" className="label">Rol</label>
                            <select
                                id="role"
                                value={changedFields.role || user.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                className="select"
                            >
                                <option value="DIRECTOR">Director</option>
                                <option value="SUBDIRECTOR">Subdirector</option>
                                <option value="SECRETARIO">Secretario</option>
                                <option value="ESCANER">Escáner</option>
                                <option value="COORDINADOR">Coordinador</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone_number" className="label">Teléfono</label>
                            <input
                                id="phone_number"
                                type="tel"
                                placeholder={user.phone_number || '987654321'}
                                value={changedFields.phone_number || ''}
                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                className="input"
                            />
                            {user.phone_number && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    Actual: {user.phone_number}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="status" className="label">Estado</label>
                            <select
                                id="status"
                                value={changedFields.status || user.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="select"
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="label">Nueva Contraseña (opcional)</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Dejar en blanco para no cambiar"
                                value={changedFields.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className="input"
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const hasChanges = Object.keys(changedFields).length > 0;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
            <div className="tabs-container mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {renderTabContent()}

                {error && (
                    <div className="p-3 rounded-lg border mt-4" style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-danger) 30%, transparent)'
                    }}>
                        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
                    </div>
                )}

                <div className="flex gap-3 justify-end pt-6 mt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{
                            backgroundColor: hasChanges ? 'var(--color-primary)' : 'var(--color-border)',
                            color: hasChanges ? 'white' : 'var(--color-text-secondary)',
                            cursor: hasChanges ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {hasChanges ? `Guardar Cambios (${Object.keys(changedFields).length})` : 'Sin Cambios'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
}
