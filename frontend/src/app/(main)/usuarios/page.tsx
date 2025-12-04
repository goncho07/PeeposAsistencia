'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Shield, User as UserIcon, Search, XCircle, Grid3x3, List, Plus, MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Users as UsersIcon, Loader2, BookOpen } from 'lucide-react';
import RoleFilterCard from '@/components/ui/RoleFilterCard';
import UserDetailModal, { UserProfile } from '@/components/modals/UserDetailModal';
import CreateUserModal from '@/components/modals/CreateUserModal';
import api from '@/lib/axios';

interface AulaInfo {
  id: number;
  codigo: string;
  nombre_completo: string;
  docente_tutor?: string;
}

interface ApiUser {
  id: number;
  name: string;
  email: string | null;
  role: 'admin' | 'student' | 'teacher' | 'parent';
  dni: string;
  level: string | null;
  grade: number | null;
  section: string | null;
  status: string;
  phone: string | null;
  area: string | null;
  avatar_url: string | null;
  aula_info: AulaInfo | null;
  student_code?: string;
  edad?: number;
  aulas_tutorizadas?: AulaInfo[];
  hijos?: Array<{ id: number; nombre: string; aula: string; }>;
}

const ROLE_MAP: Record<string, UserProfile['type']> = {
  'student': 'Estudiante',
  'teacher': 'Docente',
  'admin': 'Administrativo',
  'parent': 'Apoderado'
};

const ROLE_COLORS = {
  'Estudiante': {
    icon: GraduationCap,
    colorClass: 'text-blue-600',
    activeColorClass: 'bg-blue-600',
  },
  'Docente': {
    icon: Briefcase,
    colorClass: 'text-purple-600',
    activeColorClass: 'bg-purple-600',
  },
  'Administrativo': {
    icon: Shield,
    colorClass: 'text-slate-600',
    activeColorClass: 'bg-slate-600',
  },
  'Apoderado': {
    icon: UserIcon,
    colorClass: 'text-orange-500',
    activeColorClass: 'bg-orange-500',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUserType, setSelectedUserType] = useState<string>('Estudiante');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 12;

  const getAvatarGradient = (type: string, level?: string): string => {
    if (type === 'Estudiante' && level) {
      switch (level.toUpperCase()) {
        case 'INICIAL':
          return 'bg-gradient-to-br from-pink-400 to-rose-500';
        case 'PRIMARIA':
          return 'bg-gradient-to-br from-blue-400 to-indigo-500';
        case 'SECUNDARIA':
          return 'bg-gradient-to-br from-emerald-400 to-teal-500';
        default:
          return 'bg-gradient-to-br from-gray-400 to-gray-500';
      }
    }

    switch (type) {
      case 'Docente':
        return 'bg-gradient-to-br from-violet-500 to-purple-600';
      case 'Administrativo':
        return 'bg-gradient-to-br from-slate-500 to-slate-700';
      case 'Apoderado':
        return 'bg-gradient-to-br from-amber-400 to-orange-500';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<ApiUser[]>('/users');

      const mappedUsers: UserProfile[] = data.map(u => {
        const type = ROLE_MAP[u.role];

        let roleOrGrade = '-';
        if (type === 'Estudiante' && u.aula_info) {
          roleOrGrade = `${u.grade}° ${u.level}`;
        } else if (type === 'Docente') {
          roleOrGrade = u.area || 'Docente';
        } else if (type === 'Administrativo') {
          roleOrGrade = u.area || 'Admin';
        } else if (type === 'Apoderado') {
          roleOrGrade = u.area || 'Apoderado';
        }

        const academicLocation = type === 'Estudiante' && u.level
          ? u.level
          : '-';

        return {
          id: u.id,
          type,
          name: u.name,
          dni: u.dni || '-',
          email: u.email || '-',
          phone: u.phone || undefined,
          status: (u.status === 'activo' || u.status === 'ACTIVO'
            ? 'ACTIVO'
            : u.status === 'suspended' || u.status === 'SUSPENDIDO'
              ? 'Suspendido'
              : 'Inactivo') as any,
          section: u.section || '-',
          level: u.level || undefined,
          grade: u.grade?.toString() || undefined,
          avatarGradient: getAvatarGradient(type, u.level || undefined),
          roleOrGrade,
          academicLocation,
          avatarUrl: u.avatar_url || undefined,
          aulaInfo: u.aula_info,
          studentCode: u.student_code,
          edad: u.edad,
          aulasTutorizadas: u.aulas_tutorizadas,
          hijos: u.hijos,
        };
      });

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = useMemo(() => ({
    Estudiante: users.filter(u => u.type === 'Estudiante').length,
    Docente: users.filter(u => u.type === 'Docente').length,
    Administrativo: users.filter(u => u.type === 'Administrativo').length,
    Apoderado: users.filter(u => u.type === 'Apoderado').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.dni.includes(searchQuery) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.studentCode && user.studentCode.includes(searchQuery));
      const matchesType = selectedUserType === 'Todos' || user.type === selectedUserType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedUserType, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedUserType]);

  const handleDeleteUser = async (userId: number, userType: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await api.delete(`/users/${userId}`, {
        params: { type: userType.toLowerCase() }
      });

      // Actualizar la lista removiendo el usuario eliminado
      setUsers(prev => prev.filter(u => !(u.id === userId && u.type === userType)));

      alert('Usuario eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      alert(error.response?.data?.message || 'Error al eliminar usuario. Intente nuevamente.');
    }
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col"
      >

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <UsersIcon size={28} className="text-white/90" />
              <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
            </div>
            <p className="text-blue-100 text-sm font-medium sm:pl-10">Gestión centralizada de comunidad educativa</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-inner flex flex-col items-end">
            <p className="text-xs text-blue-100 uppercase font-bold tracking-wider mb-0.5">Total Usuarios</p>
            <p className="text-3xl font-bold leading-none">{loading ? '...' : users.length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
              <XCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error al cargar datos</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={fetchUsers}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Role Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(ROLE_COLORS).map(([type, config]) => (
            <RoleFilterCard
              key={type}
              type={type}
              label={`${type}s`}
              icon={config.icon}
              colorClass={config.colorClass}
              activeColorClass={config.activeColorClass}
              count={counts[type as keyof typeof counts]}
              isActive={selectedUserType === type}
              onClick={() => setSelectedUserType(type)}
            />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, código de estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                aria-label="Vista de cuadrícula"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                aria-label="Vista de lista"
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-200 dark:shadow-none"
            >
              <Plus size={20} /> Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <p className="text-sm font-medium">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {paginatedUsers.map(user => (
                      <motion.div
                        key={`${user.type}-${user.id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setSelectedUser(user)}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex flex-col items-center gap-3 mb-4">
                          <div className={`w-20 h-20 rounded-full ${user.avatarGradient} flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-white dark:border-slate-700 group-hover:scale-105 transition-transform`}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <>
                                {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                              </>
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
                              {user.type === 'Estudiante' && user.studentCode
                                ? `Código: ${user.studentCode}`
                                : `DNI: ${user.dni}`
                              }
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg justify-center">
                            {user.type === 'Estudiante' && <GraduationCap size={16} className="text-gray-400" />}
                            {user.type === 'Docente' && <Briefcase size={16} className="text-gray-400" />}
                            {user.type === 'Administrativo' && <Shield size={16} className="text-gray-400" />}
                            {user.type === 'Apoderado' && <UserIcon size={16} className="text-gray-400" />}
                            <span className="truncate font-medium">{user.roleOrGrade}</span>
                          </div>

                          {/* Info adicional de Aula para estudiantes */}
                          {user.type === 'Estudiante' && user.aulaInfo && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg justify-center">
                              <BookOpen size={14} />
                              <span className="font-medium">{user.aulaInfo.nombre_completo}</span>
                            </div>
                          )}

                          {/* Aulas tutorizadas para docentes */}
                          {user.type === 'Docente' && user.aulasTutorizadas && user.aulasTutorizadas.length > 0 && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                              <span className="font-medium">Tutoriza {user.aulasTutorizadas.length} aula(s)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center border-t border-gray-100 dark:border-slate-700 pt-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                            {user.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Nivel/Área</th>
                        <th className="px-6 py-4">Aula/Sección</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {paginatedUsers.map((user) => (
                        <tr key={`${user.type}-${user.id}`} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                              <div className={`w-9 h-9 rounded-full ${user.avatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}>
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  user.name.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                                  {user.type === 'Estudiante' && user.studentCode
                                    ? `Código: ${user.studentCode}`
                                    : `DNI: ${user.dni}`
                                  }
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.type === 'Estudiante' && <GraduationCap size={16} className="text-blue-500" />}
                              {user.type === 'Docente' && <Briefcase size={16} className="text-purple-500" />}
                              {user.type === 'Administrativo' && <Shield size={16} className="text-slate-500" />}
                              {user.type === 'Apoderado' && <UserIcon size={16} className="text-orange-500" />}
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{user.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.academicLocation !== '-' || user.roleOrGrade !== '-' ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-xs text-gray-600 dark:text-gray-300 font-medium">
                                {user.academicLocation !== '-' ? user.academicLocation : user.roleOrGrade}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.type === 'Estudiante' && user.aulaInfo ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <BookOpen size={12} />
                                {user.aulaInfo.codigo}
                              </span>
                            ) : user.section !== '-' ? (
                              user.section
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative group/menu inline-block">
                              <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                aria-label="Menú de acciones"
                              >
                                <MoreHorizontal size={20} />
                              </button>
                              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl hidden group-hover/menu:block z-10 p-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                >
                                  <Eye size={14} /> Ver Detalle
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); /* Implementar edición */ }}
                                  className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
                                >
                                  <Edit size={14} /> Editar
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.type); }}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Eliminar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-full mb-4">
                <Search size={32} className="opacity-30" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No se encontraron usuarios</h3>
              <p className="text-sm">Intenta con otros términos de búsqueda o filtros.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && !loading && totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50 mt-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return pageNum;
                }).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${currentPage === p
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    aria-label={`Página ${p}`}
                    aria-current={currentPage === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </AnimatePresence>
        <AnimatePresence>
          {isCreateModalOpen && (
            <CreateUserModal
              isOpen={isCreateModalOpen}
              onClose={() => {
                setIsCreateModalOpen(false);
                fetchUsers();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}