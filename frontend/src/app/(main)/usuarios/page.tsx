'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Shield, User, Search, XCircle, Grid3x3, List, Plus, MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react';
import RoleFilterCard from '@/components/ui/RoleFilterCard';
import UserDetailModal, { UserProfile } from '@/components/modals/UserDetailModal';
import CreateUserModal from '@/components/modals/CreateUserModal';

const SECTIONS_INICIAL = [
  'MARGARITAS_3AÑOS', 'CRISANTEMOS_3AÑOS', 
  'JASMINEZ_4AÑOS', 'ROSAS_4AÑOS', 'LIRIOS_4AÑOS', 'GERANIOS_4AÑOS', 
  'ORQUIDEAS_5AÑOS', 'TULIPANES_5AÑOS', 'GIRASOLES_5AÑOS', 'CLAVELES_5AÑOS'
];

const SECTIONS_PRIMARIA = [
  '1A', '1B', '1C', 
  '2A', '2B', '2C', 
  '3A', '3B', '3C', 
  '4A', '4B', '4C', '4D', 
  '5A', '5B', '5C', 
  '6A', '6B', '6C'
];

const SECTIONS_SECUNDARIA = [
  '1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H',
  '2A', '2B', '2C', '2D', '2E', '2F', '2G',
  '3A', '3B', '3C', '3D', '3E', '3F', '3G',
  '4A', '4B', '4C', '4D', '4E', '4F',
  '5A', '5B', '5C', '5D', '5E', '5F'
];

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
  const itemsPerPage = 10;

  const mockUsers: UserProfile[] = useMemo(() => {
    const users: UserProfile[] = [];
    const names = ['Matías Flores', 'Sofía Vargas', 'Liam Torres', 'Valentina Ruiz', 'Thiago Castro', 'Camila Rojas', 'Mateo Cruz', 'Luciana Pavez', 'Gabriel Soto', 'Isabella Mendoza'];
    for (let i = 0; i < 80; i++) {
      let type: UserProfile['type'];
      if (i < 40) type = 'Estudiante';
      else if (i < 55) type = 'Docente';
      else if (i < 65) type = 'Administrativo';
      else type = 'Apoderado';

      const name = `${names[i % names.length]} ${String.fromCharCode(65 + i%26)}.`;
      const level = i % 3 === 0 ? 'Inicial' : i % 3 === 1 ? 'Primaria' : 'Secundaria';
      
      let academicLocation = '-';
      let gradeText = '-';
      let avatarGradient = 'bg-gray-500';
      let section = '-';

      if (type === 'Estudiante') {
         if (level === 'Inicial') {
            gradeText = '5 Años';
            section = SECTIONS_INICIAL[i % SECTIONS_INICIAL.length];
            avatarGradient = 'bg-gradient-to-br from-pink-400 to-rose-500';
         } else if (level === 'Primaria') {
            gradeText = '5to Grado';
            section = SECTIONS_PRIMARIA[i % SECTIONS_PRIMARIA.length];
            avatarGradient = 'bg-gradient-to-br from-blue-400 to-indigo-500';
         } else {
            gradeText = '3ro Año';
            section = SECTIONS_SECUNDARIA[i % SECTIONS_SECUNDARIA.length];
            avatarGradient = 'bg-gradient-to-br from-emerald-400 to-teal-500';
         }
         academicLocation = level; 
      } else if (type === 'Docente') {
         gradeText = 'Docente';
         avatarGradient = 'bg-gradient-to-br from-violet-500 to-purple-600';
         academicLocation = '-';
      } else if (type === 'Administrativo') {
         gradeText = 'Admin';
         avatarGradient = 'bg-gradient-to-br from-slate-500 to-slate-700';
         academicLocation = '-';
      } else {
         gradeText = 'Apoderado';
         avatarGradient = 'bg-gradient-to-br from-amber-400 to-orange-500';
         academicLocation = '-';
      }

      users.push({
        id: i + 1,
        type,
        name,
        dni: `7${Math.floor(Math.random()*10000000)}`,
        avatarGradient,
        roleOrGrade: type === 'Estudiante' ? gradeText : (type === 'Apoderado' ? 'Padre de Familia' : gradeText),
        email: `user${i}@peepos.edu.pe`,
        phone: `9${Math.floor(Math.random()*100000000)}`,
        status: Math.random() > 0.1 ? 'Activo' : 'Inactivo',
        level: type === 'Estudiante' ? level : undefined,
        academicLocation,
        section: section,
        grade: gradeText
      });
    }
    return users;
  }, []);

  const counts = useMemo(() => ({
    Estudiante: mockUsers.filter(u => u.type === 'Estudiante').length,
    Docente: mockUsers.filter(u => u.type === 'Docente').length,
    Administrativo: mockUsers.filter(u => u.type === 'Administrativo').length,
    Apoderado: mockUsers.filter(u => u.type === 'Apoderado').length,
  }), [mockUsers]);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.dni.includes(searchQuery);
      const matchesType = selectedUserType === 'Todos' || user.type === selectedUserType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedUserType, mockUsers]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1400px] px-8 py-6 flex flex-col">
        
        {/* 1. Compact Hero Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 flex justify-between items-center">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <UsersIcon size={28} className="text-white/90"/>
                <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
             </div>
             <p className="text-blue-100 text-sm font-medium pl-10">Gestión centralizada de comunidad educativa</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-inner flex flex-col items-end">
             <p className="text-xs text-blue-100 uppercase font-bold tracking-wider mb-0.5">Total Usuarios</p>
             <p className="text-3xl font-bold leading-none">{mockUsers.length}</p>
          </div>
        </div>

        {/* 2. Role Filters (KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <RoleFilterCard 
             type="Estudiante" 
             label="Estudiantes" 
             icon={GraduationCap} 
             colorClass="text-blue-600" 
             activeColorClass="bg-blue-600" 
             count={counts.Estudiante}
             isActive={selectedUserType === 'Estudiante'}
             onClick={() => { setSelectedUserType('Estudiante'); setCurrentPage(1); }}
           />
           <RoleFilterCard 
             type="Docente" 
             label="Docentes" 
             icon={Briefcase} 
             colorClass="text-purple-600" 
             activeColorClass="bg-purple-600" 
             count={counts.Docente}
             isActive={selectedUserType === 'Docente'}
             onClick={() => { setSelectedUserType('Docente'); setCurrentPage(1); }}
           />
           <RoleFilterCard 
             type="Administrativo" 
             label="Administrativos" 
             icon={Shield} 
             colorClass="text-slate-600" 
             activeColorClass="bg-slate-600" 
             count={counts.Administrativo}
             isActive={selectedUserType === 'Administrativo'}
             onClick={() => { setSelectedUserType('Administrativo'); setCurrentPage(1); }}
           />
           <RoleFilterCard 
             type="Apoderado" 
             label="Apoderados" 
             icon={User} 
             colorClass="text-orange-500" 
             activeColorClass="bg-orange-500" 
             count={counts.Apoderado}
             isActive={selectedUserType === 'Apoderado'}
             onClick={() => { setSelectedUserType('Apoderado'); setCurrentPage(1); }}
           />
        </div>

        {/* 3. Toolbar (Search & Actions) */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
           <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder={`Buscar ${selectedUserType.toLowerCase()} por nombre o DNI...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <XCircle size={16} />
                </button>
              )}
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}><Grid3x3 size={20}/></button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}><List size={20}/></button>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-200 dark:shadow-none"
              >
                <Plus size={20} /> Nuevo Usuario
              </button>
           </div>
        </div>

        {/* 4. Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
           {filteredUsers.length > 0 ? (
             <>
               {viewMode === 'grid' ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {paginatedUsers.map(user => (
                        <motion.div
                          key={user.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setSelectedUser(user)}
                          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                        >
                           <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           
                           <div className="flex flex-col items-center gap-3 mb-4">
                             <div className={`w-20 h-20 rounded-full ${user.avatarGradient} flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-white dark:border-slate-700 group-hover:scale-105 transition-transform`}>
                                {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}
                             </div>
                             <div className="text-center">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">DNI: {user.dni}</p>
                             </div>
                           </div>

                           <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg justify-center">
                                 {user.type === 'Estudiante' ? <GraduationCap size={16} className="text-gray-400"/> : <Briefcase size={16} className="text-gray-400"/>}
                                 <span className="truncate font-medium">{user.roleOrGrade}</span>
                              </div>
                           </div>

                           <div className="flex justify-center border-t border-gray-100 dark:border-slate-700 pt-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Activo' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
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
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Área</th>
                          <th className="px-6 py-4">Sección</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                 <div className={`w-9 h-9 rounded-full ${user.avatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                                   {user.name.charAt(0)}
                                 </div>
                                 <div>
                                   <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">{user.name}</p>
                                   <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">DNI: {user.dni}</p>
                                 </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {user.type === 'Estudiante' && <GraduationCap size={16} className="text-blue-500"/>}
                                    {user.type === 'Docente' && <Briefcase size={16} className="text-purple-500"/>}
                                    {user.type === 'Administrativo' && <Shield size={16} className="text-slate-500"/>}
                                    {user.type === 'Apoderado' && <User size={16} className="text-orange-500"/>}
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{user.type}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                               {user.academicLocation !== '-' && (
                                   <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-xs text-gray-600 dark:text-gray-300 font-medium">
                                     {user.academicLocation}
                                   </span>
                               )}
                               {user.academicLocation === '-' && <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                {user.section !== '-' ? user.section : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="relative group/menu inline-block">
                                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <MoreHorizontal size={20} />
                                  </button>
                                  <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl hidden group-hover/menu:block z-10 p-1">
                                     <button onClick={() => setSelectedUser(user)} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"><Eye size={14}/> Ver Detalle</button>
                                     <button className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"><Edit size={14}/> Editar</button>
                                     <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                     <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"><Trash2 size={14}/> Eliminar</button>
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
           {filteredUsers.length > 0 && (
             <div className="border-t border-gray-200 dark:border-slate-800 p-4 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50 mt-auto">
                <span className="text-sm text-gray-500 dark:text-gray-400">Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios</span>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                   >
                     <ChevronLeft size={18} />
                   </button>
                   {Array.from({length: Math.min(3, totalPages)}, (_, i) => i + 1).map(p => (
                      <button 
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${currentPage === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                      >
                        {p}
                      </button>
                   ))}
                   <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                   >
                     <ChevronRight size={18} />
                   </button>
                </div>
             </div>
           )}
        </div>

        <AnimatePresence>{selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}</AnimatePresence>
        <AnimatePresence>{isCreateModalOpen && <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}</AnimatePresence>
      </motion.div>
    </div>
  );
}