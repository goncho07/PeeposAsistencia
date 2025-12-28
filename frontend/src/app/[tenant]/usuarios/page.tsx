'use client';
import { useEffect, useState, useMemo } from 'react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { UserKPICard } from '@/app/components/UserKPICard';
import { UserSearchBar } from '@/app/components/UserSearchBar';
import { UserTable } from '@/app/components/UserTable';
import { UserDetailModal } from '@/app/components/modals/UserDetailModal';
import { UserEditModal } from '@/app/components/modals/UserEditModal';
import { UserDeleteModal } from '@/app/components/modals/UserDeleteModal';
import { UserCreateModal } from '@/app/components/modals/UserCreateModal';
import { CarnetGeneratorModal } from '@/app/components/modals/CarnetGeneratorModal';
import { ToastContainer } from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { Users, GraduationCap, UserCircle, Shield } from 'lucide-react';
import { usersService, Entity, EntityType, Student, Teacher, Parent, User } from '@/lib/api/users';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export default function UsuariosPage() {
    const { toasts, success, error: showError, removeToast } = useToast();

    const [activeType, setActiveType] = useState<EntityType>('student');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [carnetModalOpen, setCarnetModalOpen] = useState(false);


    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [studentsData, teachersData, parentsData, usersData] = await Promise.all([
                usersService.getStudents(),
                usersService.getTeachers(),
                usersService.getParents(),
                usersService.getUsers()
            ]);

            setStudents(studentsData);
            setTeachers(teachersData);
            setParents(parentsData);
            setUsers(usersData);
            setError(null);
        } catch (err) {
            setError('No se pudieron cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const filteredEntities = useMemo(() => {
        let entities: Entity[] = [];

        switch (activeType) {
            case 'student':
                entities = students;
                break;
            case 'teacher':
                entities = teachers;
                break;
            case 'parent':
                entities = parents;
                break;
            case 'user':
                entities = users;
                break;
        }

        if (!searchQuery.trim()) return entities;

        const query = searchQuery.toLowerCase().trim();

        return entities.filter((entity) => {
            const fullName = entity.full_name.toLowerCase();
            const identifier = activeType === 'student'
                ? (entity as Student).student_code
                : activeType === 'teacher' || activeType === 'user'
                    ? (entity as Teacher | User).dni
                    : (entity as Parent).document_number;

            if (fullName.includes(query) || identifier.toLowerCase().includes(query)) {
                return true;
            }

            if (activeType === 'student') {
                const student = entity as Student;
                if (student.classroom) {
                    const level = student.classroom.level.toLowerCase();
                    const grade = student.classroom.grade.toString();
                    const section = student.classroom.section.toLowerCase();
                    const fullClassroom = student.classroom.full_name.toLowerCase();

                    if (level.includes(query)) {
                        return true;
                    }

                    const gradeSection = `${grade}${section}`;
                    const gradeOrdinalSection = `${grade}°${section}`;

                    if (query === gradeSection || query === gradeOrdinalSection) {
                        return true;
                    }

                    if (fullClassroom.includes(query)) {
                        return true;
                    }
                }
            }

            if (activeType === 'teacher') {
                const teacher = entity as Teacher;
                const teacherLevel = teacher.level?.toLowerCase() || '';

                if (teacherLevel.includes(query)) {
                    return true;
                }

                if (teacher.classrooms && teacher.classrooms.length > 0) {
                    return teacher.classrooms.some((classroom) => {
                        const level = classroom.level.toLowerCase();
                        const grade = classroom.grade.toString();
                        const section = classroom.section.toLowerCase();
                        const fullClassroom = classroom.full_name.toLowerCase();

                        if (level.includes(query)) {
                            return true;
                        }

                        const gradeSection = `${grade}${section}`;
                        const gradeOrdinalSection = `${grade}°${section}`;

                        if (query === gradeSection || query === gradeOrdinalSection) {
                            return true;
                        }

                        if (fullClassroom.includes(query)) {
                            return true;
                        }

                        return false;
                    });
                }
            }

            return false;
        });
    }, [activeType, students, teachers, parents, users, searchQuery]);

    const paginatedEntities = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredEntities.slice(start, end);
    }, [filteredEntities, currentPage]);

    const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeType, searchQuery]);

    const kpiData = [
        {
            title: 'Estudiantes',
            count: loading ? '—' : students.length,
            icon: Users,
            gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
            type: 'student' as EntityType
        },
        {
            title: 'Docentes',
            count: loading ? '—' : teachers.length,
            icon: GraduationCap,
            gradient: 'bg-gradient-to-br from-green-500 to-green-700',
            type: 'teacher' as EntityType
        },
        {
            title: 'Apoderados',
            count: loading ? '—' : parents.length,
            icon: UserCircle,
            gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
            type: 'parent' as EntityType
        },
        {
            title: 'Administrativos',
            count: loading ? '—' : users.length,
            icon: Shield,
            gradient: 'bg-gradient-to-br from-amber-500 to-amber-700',
            type: 'user' as EntityType
        }
    ];

    const totalEntities = students.length + teachers.length + parents.length + users.length;

    const handleView = (entity: Entity) => {
        setSelectedEntity(entity);
        setDetailModalOpen(true);
    };

    const handleEdit = (entity: Entity) => {
        setSelectedEntity(entity);
        setEditModalOpen(true);
    };

    const handleDelete = (entity: Entity) => {
        setSelectedEntity(entity);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedEntity) return;

        try {
            const entityName = selectedEntity.full_name;
            const entityTypeLabel = {
                student: 'estudiante',
                teacher: 'docente',
                parent: 'apoderado',
                user: 'usuario'
            }[activeType];

            if (activeType === 'student') {
                await usersService.deleteStudent(selectedEntity.id);
            } else if (activeType === 'teacher') {
                await usersService.deleteTeacher(selectedEntity.id);
            } else if (activeType === 'parent') {
                await usersService.deleteParent(selectedEntity.id);
            } else if (activeType === 'user') {
                await usersService.deleteUser(selectedEntity.id);
            }

            await fetchAllData();
            success(
                'Eliminado exitosamente',
                `El ${entityTypeLabel} ${entityName} ha sido eliminado del sistema.`
            );
        } catch (err: any) {
            const message = err.response?.data?.message || 'No se pudo eliminar el registro.';
            showError('Error al eliminar', message);
            throw err;
        }
    };

    const handleEditSuccess = async () => {
        const entityTypeLabel = {
            student: 'Estudiante',
            teacher: 'Docente',
            parent: 'Apoderado',
            user: 'Usuario'
        }[activeType];

        await fetchAllData();
        success(
            `${entityTypeLabel} actualizado`,
            'Los cambios se han guardado correctamente.'
        );
    };

    const handleCreateSuccess = async () => {
        const entityTypeLabel = {
            student: 'Estudiante',
            teacher: 'Docente',
            parent: 'Apoderado',
            user: 'Usuario'
        }[activeType];

        await fetchAllData();
        success(
            `${entityTypeLabel} creado`,
            'El nuevo registro se ha guardado exitosamente.'
        );
    };

    const handleAdd = () => {
        setCreateModalOpen(true);
    };

    return (
        <DashboardLayout>
            <HeroHeader
                title="Usuarios"
                subtitle="Gestiona estudiantes, docentes, apoderados y personal administrativo."
                icon={Users}
                breadcrumbs={[
                    { label: 'Usuarios' }
                ]}
            />

            {error && (
                <div className="card mb-4">
                    <div className="text-center py-4">
                        <p style={{ color: 'var(--color-danger)' }} className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
                {kpiData.map((kpi) => (
                    <UserKPICard
                        key={kpi.type}
                        title={kpi.title}
                        count={kpi.count}
                        icon={kpi.icon}
                        gradient={kpi.gradient}
                        active={activeType === kpi.type}
                        onClick={() => setActiveType(kpi.type)}
                    />
                ))}
            </motion.div>

            <UserSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClick={handleAdd}
                onCarnetClick={() => setCarnetModalOpen(true)}
                entityType={activeType}
            />

            {loading ? (
                <div className="card">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando datos...</p>
                    </div>
                </div>
            ) : (
                <UserTable
                    entities={paginatedEntities}
                    entityType={activeType}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <UserDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                entity={selectedEntity}
                entityType={activeType}
            />

            <UserEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                entity={selectedEntity}
                entityType={activeType}
            />

            <UserDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                entity={selectedEntity}
                entityType={activeType}
            />

            <UserCreateModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                entityType={activeType}
            />

            <CarnetGeneratorModal
                isOpen={carnetModalOpen}
                onClose={() => setCarnetModalOpen(false)}
                onSuccess={(message) => success('Carnets', message)}
            />

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </DashboardLayout>
    );
}