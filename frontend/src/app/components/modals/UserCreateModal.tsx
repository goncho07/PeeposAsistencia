'use client';
import { useState, useEffect, useMemo } from 'react';
import { BaseModal } from './BaseModal';
import { EntityType, usersService } from '@/lib/api/users';
import { UserPlus, IdCard, CreditCard, Cake, UserCircle2, Building2, BookOpen, Mail, Phone, Award, Heart, Plus, Trash2, AlertCircle, Users, Search } from 'lucide-react';

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

type CreateTabType = 'personal' | 'academic' | 'contact' | 'relations';

export function UserCreateModal({ isOpen, onClose, onSuccess, entityType }: UserCreateModalProps) {
    const [activeTab, setActiveTab] = useState<CreateTabType>('personal');
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [availableParents, setAvailableParents] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [parentSearchQuery, setParentSearchQuery] = useState('');
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('personal');
            setFormData(getInitialFormData());
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

    const getTabs = (): { id: CreateTabType; label: string }[] => {
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
        return availableStudents.filter((student) => {
            const fullName = student.full_name?.toLowerCase() || '';
            const studentCode = student.student_code?.toLowerCase() || '';
            const classroom = student.classroom?.full_name?.toLowerCase() || '';
            return fullName.includes(query) || studentCode.includes(query) || classroom.includes(query);
        });
    }, [availableStudents, studentSearchQuery]);

    const getInitialFormData = () => {
        const base = {
            name: '',
            paternal_surname: '',
            maternal_surname: '',
        };

        if (entityType === 'student') {
            return {
                ...base,
                student_code: '',
                document_type: 'DNI',
                document_number: '',
                gender: 'M',
                birth_date: '',
                classroom_id: '',
                parents: [],
            };
        }

        if (entityType === 'teacher') {
            return {
                ...base,
                dni: '',
                birth_date: '',
                gender: 'M',
                level: 'PRIMARIA',
                area: '',
                email: '',
                phone_number: '',
            };
        }

        if (entityType === 'parent') {
            return {
                ...base,
                document_type: 'DNI',
                document_number: '',
                phone_number: '',
                email: '',
                students: [],
            };
        }

        if (entityType === 'user') {
            return {
                ...base,
                dni: '',
                email: '',
                password: '',
                role: 'SECRETARIO',
                phone_number: '',
            };
        }

        return base;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (entityType === 'student') {
                await usersService.createStudent(formData);
            } else if (entityType === 'teacher') {
                await usersService.createTeacher(formData);
            } else if (entityType === 'parent') {
                await usersService.createParent(formData);
            } else if (entityType === 'user') {
                await usersService.createUser(formData);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear. Verifica los datos ingresados.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const addParentRelation = () => {
        setFormData((prev: any) => ({
            ...prev,
            parents: [
                ...(prev.parents || []),
                {
                    parent_id: '',
                    relationship_type: 'PADRE',
                    custom_relationship_label: '',
                    is_primary_contact: (prev.parents || []).length === 0,
                    receives_notifications: true,
                }
            ]
        }));
    };

    const removeParentRelation = (index: number) => {
        setFormData((prev: any) => {
            const newParents = [...(prev.parents || [])];
            newParents.splice(index, 1);
            if (newParents.length > 0 && newParents[0]) {
                newParents[0].is_primary_contact = true;
            }
            return { ...prev, parents: newParents };
        });
    };

    const updateParentRelation = (index: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const newParents = [...(prev.parents || [])];
            newParents[index] = { ...newParents[index], [field]: value };

            if (field === 'is_primary_contact' && value === true) {
                newParents.forEach((p, i) => {
                    if (i !== index) p.is_primary_contact = false;
                });
            }

            return { ...prev, parents: newParents };
        });
    };

    const addStudentRelation = () => {
        setFormData((prev: any) => ({
            ...prev,
            students: [
                ...(prev.students || []),
                {
                    student_id: '',
                    relationship_type: 'PADRE',
                    custom_relationship_label: '',
                    is_primary_contact: false,
                    receives_notifications: true,
                }
            ]
        }));
    };

    const removeStudentRelation = (index: number) => {
        setFormData((prev: any) => {
            const newStudents = [...(prev.students || [])];
            newStudents.splice(index, 1);
            return { ...prev, students: newStudents };
        });
    };

    const updateStudentRelation = (index: number, field: string, value: any) => {
        setFormData((prev: any) => {
            const newStudents = [...(prev.students || [])];
            newStudents[index] = { ...newStudents[index], [field]: value };
            return { ...prev, students: newStudents };
        });
    };

    const getModalTitle = () => {
        const titles: Record<EntityType, string> = {
            student: 'Nuevo Estudiante',
            teacher: 'Nuevo Docente',
            parent: 'Nuevo Apoderado',
            user: 'Nuevo Usuario',
        };
        return titles[entityType];
    };

    // ===== STUDENT TABS =====
    const renderStudentPersonalTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <UserCircle2 className="w-5 h-5" />
                    <h3>Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label htmlFor="name" className="label">Nombre *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className="input"
                            placeholder="Juan"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paternal_surname" className="label">Apellido Paterno *</label>
                        <input
                            id="paternal_surname"
                            type="text"
                            value={formData.paternal_surname || ''}
                            onChange={(e) => handleChange('paternal_surname', e.target.value)}
                            required
                            className="input"
                            placeholder="Pérez"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maternal_surname" className="label">Apellido Materno *</label>
                        <input
                            id="maternal_surname"
                            type="text"
                            value={formData.maternal_surname || ''}
                            onChange={(e) => handleChange('maternal_surname', e.target.value)}
                            required
                            className="input"
                            placeholder="García"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="gender" className="label">Género *</label>
                        <select
                            id="gender"
                            value={formData.gender || 'M'}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            required
                            className="select"
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="birth_date" className="label">Fecha de Nacimiento *</label>
                        <input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date || ''}
                            onChange={(e) => handleChange('birth_date', e.target.value)}
                            required
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
                        <label htmlFor="student_code" className="label">Código de Estudiante *</label>
                        <input
                            id="student_code"
                            type="text"
                            value={formData.student_code || ''}
                            onChange={(e) => handleChange('student_code', e.target.value)}
                            required
                            className="input"
                            placeholder="EST2024001"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="document_type" className="label">Tipo de Documento *</label>
                        <select
                            id="document_type"
                            value={formData.document_type || 'DNI'}
                            onChange={(e) => handleChange('document_type', e.target.value)}
                            required
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
                        <label htmlFor="document_number" className="label">Número de Documento *</label>
                        <input
                            id="document_number"
                            type="text"
                            value={formData.document_number || ''}
                            onChange={(e) => handleChange('document_number', e.target.value)}
                            required
                            className="input"
                            placeholder="12345678"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStudentAcademicTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <Building2 className="w-5 h-5" />
                    <h3>Información Académica</h3>
                </div>
                <div className="form-group">
                    <label htmlFor="classroom_id" className="label">Aula *</label>
                    <select
                        id="classroom_id"
                        value={formData.classroom_id || ''}
                        onChange={(e) => handleChange('classroom_id', e.target.value)}
                        required
                        className="select"
                    >
                        <option value="">Seleccionar aula</option>
                        {classrooms.map((classroom) => (
                            <option key={classroom.id} value={classroom.id}>
                                {classroom.full_name} - {classroom.shift}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStudentRelationsTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <Heart className="w-5 h-5" />
                    <h3>Apoderados</h3>
                    <button
                        type="button"
                        onClick={addParentRelation}
                        disabled={formData.parents?.length >= 4}
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

                {formData.parents?.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--color-text-secondary)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            No hay apoderados asignados. Opcional: puedes añadir apoderados ahora o después.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.parents?.map((parent: any, index: number) => (
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
                                            value={parent.parent_id || ''}
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
                                            value={parent.relationship_type || 'PADRE'}
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

                                    {parent.relationship_type === 'OTRO' && (
                                        <div className="form-group md:col-span-2">
                                            <label className="label">Etiqueta Personalizada</label>
                                            <input
                                                type="text"
                                                value={parent.custom_relationship_label || ''}
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
                                                checked={parent.is_primary_contact || false}
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
                                                checked={parent.receives_notifications !== false}
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
                )}

                {formData.parents?.length >= 4 && (
                    <div className="mt-3 p-3 rounded-lg border" style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                    }}>
                        <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
                            Se ha alcanzado el máximo de 4 apoderados permitidos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    // ===== TEACHER TABS =====
    const renderTeacherPersonalTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <UserCircle2 className="w-5 h-5" />
                    <h3>Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label htmlFor="name" className="label">Nombre *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paternal_surname" className="label">Apellido Paterno *</label>
                        <input
                            id="paternal_surname"
                            type="text"
                            value={formData.paternal_surname || ''}
                            onChange={(e) => handleChange('paternal_surname', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maternal_surname" className="label">Apellido Materno *</label>
                        <input
                            id="maternal_surname"
                            type="text"
                            value={formData.maternal_surname || ''}
                            onChange={(e) => handleChange('maternal_surname', e.target.value)}
                            required
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
                        <label htmlFor="dni" className="label">DNI *</label>
                        <input
                            id="dni"
                            type="text"
                            value={formData.dni || ''}
                            onChange={(e) => handleChange('dni', e.target.value)}
                            required
                            maxLength={8}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender" className="label">Género *</label>
                        <select
                            id="gender"
                            value={formData.gender || 'M'}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            required
                            className="select"
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="birth_date" className="label">Fecha de Nacimiento *</label>
                        <input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date || ''}
                            onChange={(e) => handleChange('birth_date', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTeacherProfessionalTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <BookOpen className="w-5 h-5" />
                    <h3>Información Profesional</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="level" className="label">Nivel *</label>
                        <select
                            id="level"
                            value={formData.level || 'PRIMARIA'}
                            onChange={(e) => handleChange('level', e.target.value)}
                            required
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
                            value={formData.area || ''}
                            onChange={(e) => handleChange('area', e.target.value)}
                            className="input"
                            placeholder="Ej: Matemáticas"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTeacherContactTab = () => (
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
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone_number" className="label">Teléfono</label>
                        <input
                            id="phone_number"
                            type="tel"
                            value={formData.phone_number || ''}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // ===== PARENT TABS =====
    const renderParentPersonalTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <UserCircle2 className="w-5 h-5" />
                    <h3>Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label htmlFor="name" className="label">Nombre *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paternal_surname" className="label">Apellido Paterno *</label>
                        <input
                            id="paternal_surname"
                            type="text"
                            value={formData.paternal_surname || ''}
                            onChange={(e) => handleChange('paternal_surname', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maternal_surname" className="label">Apellido Materno *</label>
                        <input
                            id="maternal_surname"
                            type="text"
                            value={formData.maternal_surname || ''}
                            onChange={(e) => handleChange('maternal_surname', e.target.value)}
                            required
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="document_type" className="label">Tipo de Documento *</label>
                        <select
                            id="document_type"
                            value={formData.document_type || 'DNI'}
                            onChange={(e) => handleChange('document_type', e.target.value)}
                            required
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
                        <label htmlFor="document_number" className="label">Número de Documento *</label>
                        <input
                            id="document_number"
                            type="text"
                            value={formData.document_number || ''}
                            onChange={(e) => handleChange('document_number', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderParentContactTab = () => (
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
                            value={formData.phone_number || ''}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="label">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderParentRelationsTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <Users className="w-5 h-5" />
                    <h3>Estudiantes</h3>
                    <button
                        type="button"
                        onClick={addStudentRelation}
                        disabled={formData.students?.length >= 10}
                        className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white'
                        }}
                    >
                        <Plus size={16} />
                        Añadir
                    </button>
                </div>

                {formData.students?.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--color-text-secondary)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            No hay estudiantes asignados. Opcional: puedes añadir estudiantes ahora o después.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.students?.map((student: any, index: number) => (
                            <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                        Estudiante #{index + 1}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => removeStudentRelation(index)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group md:col-span-2">
                                        <label className="label">Estudiante *</label>

                                        <div className="relative mb-2 input-with-icon">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 pointer" style={{ color: 'var(--color-text-secondary)' }} />
                                            <input
                                                type="text"
                                                value={studentSearchQuery}
                                                onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                placeholder="Buscar por nombre, código o aula..."
                                                className="input text-sm"
                                            />
                                        </div>

                                        <select
                                            value={student.student_id || ''}
                                            onChange={(e) => updateStudentRelation(index, 'student_id', e.target.value)}
                                            required
                                            className="select"
                                        >
                                            <option value="">Seleccionar estudiante</option>
                                            {filteredStudents.length === 0 && studentSearchQuery ? (
                                                <option value="" disabled>No se encontraron resultados</option>
                                            ) : (
                                                filteredStudents.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.full_name} - {s.student_code} {s.classroom?.full_name ? `(${s.classroom.full_name})` : ''}
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
                                        <label className="label">Tipo de Relación *</label>
                                        <select
                                            value={student.relationship_type || 'PADRE'}
                                            onChange={(e) => updateStudentRelation(index, 'relationship_type', e.target.value)}
                                            required
                                            className="select"
                                        >
                                            <option value="PADRE">Padre</option>
                                            <option value="MADRE">Madre</option>
                                            <option value="APODERADO">Apoderado</option>
                                        </select>
                                    </div>


                                    {student.relationship_type === 'APODERADO' && (
                                        <div className="form-group md:col-span-2">
                                            <label className="label">Etiqueta Personalizada</label>
                                            <input
                                                type="text"
                                                value={student.custom_relationship_label || ''}
                                                onChange={(e) => updateStudentRelation(index, 'custom_relationship_label', e.target.value)}
                                                placeholder="Ej: Tutor legal, Guardián"
                                                className="input"
                                                maxLength={50}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={student.is_primary_contact || false}
                                                onChange={(e) => updateStudentRelation(index, 'is_primary_contact', e.target.checked)}
                                                className="w-4 h-4 rounded"
                                                style={{ accentColor: 'var(--color-primary)' }}
                                            />
                                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                                Contacto principal para este estudiante
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={student.receives_notifications !== false}
                                                onChange={(e) => updateStudentRelation(index, 'receives_notifications', e.target.checked)}
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
                )}

                {formData.students?.length >= 10 && (
                    <div className="mt-3 p-3 rounded-lg border" style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)'
                    }}>
                        <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
                            Se ha alcanzado el máximo de 10 estudiantes permitidos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    // ===== USER TABS =====
    const renderUserPersonalTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <UserCircle2 className="w-5 h-5" />
                    <h3>Información Personal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label htmlFor="name" className="label">Nombre *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paternal_surname" className="label">Apellido Paterno *</label>
                        <input
                            id="paternal_surname"
                            type="text"
                            value={formData.paternal_surname || ''}
                            onChange={(e) => handleChange('paternal_surname', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maternal_surname" className="label">Apellido Materno *</label>
                        <input
                            id="maternal_surname"
                            type="text"
                            value={formData.maternal_surname || ''}
                            onChange={(e) => handleChange('maternal_surname', e.target.value)}
                            required
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="dni" className="label">DNI *</label>
                        <input
                            id="dni"
                            type="text"
                            value={formData.dni || ''}
                            onChange={(e) => handleChange('dni', e.target.value)}
                            required
                            maxLength={8}
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="label">Correo Electrónico *</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserSystemTab = () => (
        <div className="space-y-5">
            <div className="detail-card">
                <div className="detail-card-header">
                    <Award className="w-5 h-5" />
                    <h3>Información del Sistema</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label htmlFor="role" className="label">Rol *</label>
                        <select
                            id="role"
                            value={formData.role || 'SECRETARIO'}
                            onChange={(e) => handleChange('role', e.target.value)}
                            required
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
                            value={formData.phone_number || ''}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="label">Contraseña *</label>
                    <input
                        id="password"
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                        required
                        className="input"
                        placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos
                    </p>
                </div>
            </div>
        </div>
    );

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

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="tabs-container">
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

                <div className="mb-6">
                    {renderTabContent()}
                </div>

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
                            backgroundColor: 'var(--color-primary)',
                            color: 'white'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Creando...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Crear {getModalTitle().split(' ')[1]}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
}
