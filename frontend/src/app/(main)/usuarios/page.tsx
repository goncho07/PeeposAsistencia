'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, XCircle, Grid3x3, List, Plus, 
  GraduationCap, Briefcase, Shield, User, MoreHorizontal, 
  Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, Loader2 
} from 'lucide-react';
import RoleFilterCard from '@/components/ui/RoleFilterCard';
import api from '@/lib/axios';

// --- COMPONENTS LOCALES (MODALES) PARA INTEGRACIÓN ---

const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    role: 'Estudiante',
    password: 'password123', // Default temporal
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/users', formData);
      alert('Usuario creado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al crear usuario. Verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Nuevo Usuario</h2>
          <button onClick={onClose}><X size={20} className="dark:text-white"/></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium dark:text-gray-300">Rol</label>
                <select 
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Estudiante">Estudiante</option>
                  <option value="Docente">Docente</option>
                  <option value="Administrativo">Administrativo</option>
                </select>
             </div>
             <div>
                <label className="text-sm font-medium dark:text-gray-300">DNI</label>
                <input 
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  value={formData.dni}
                  onChange={e => setFormData({...formData, dni: e.target.value})}
                />
             </div>
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Nombre Completo</label>
            <input 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-300">Email</label>
            <input 
              className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
           <button onClick={onClose} className="px-4 py-2 text-gray-600">Cancelar</button>
           <button 
             onClick={handleSubmit} 
             disabled={loading}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
           >
             {loading && <Loader2 className="animate-spin" size={16}/>} Guardar
           </button>
        </div>
      </div>
    </div>
  );
};

const UserDetailModal: React.FC<{ user: any | null; onClose: () => void }> = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-8 relative" onClick={e => e.stopPropagation()}>
         <button onClick={onClose} className="absolute top-4 right-4"><X/></button>
         <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
               {user.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold dark:text-white">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-6 w-full space-y-3">
               <div className="flex justify-between border-b py-2 dark:border-slate-700">
                  <span className="text-gray-500">DNI</span>
                  <span className="font-medium dark:text-white">{user.dni}</span>
               </div>
               <div className="flex justify-between border-b py-2 dark:border-slate-700">
                  <span className="text-gray-500">Rol</span>
                  <span className="font-medium dark:text-white">{user.role}</span>
               </div>
               <div className="flex justify-between border-b py-2 dark:border-slate-700">
                  <span className="text-gray-500">Estado</span>
                  <span className="font-medium text-green-600">Activo</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUserType, setSelectedUserType] = useState<string>('Todos');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // FETCH DATOS REALES
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      // Soporte para respuesta directa array o paginada de Laravel
      setUsers(Array.isArray(data) ? data : data.data || []); 
    } catch (error) {
      console.error("Error fetching users:", error);
      // Fallback vacío elegante
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if(!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      alert("Error al eliminar usuario");
    }
  };

  // Lógica de Filtrado (Client Side para MVP)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.dni?.includes(searchQuery);
      // Mapeo flexible de roles (backend vs frontend labels)
      const type = user.role || 'Estudiante'; 
      const matchesType = selectedUserType === 'Todos' || type === selectedUserType || (selectedUserType === 'Administrativo' && type === 'admin');
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedUserType, users]);

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getAvatarGradient = (role: string) => {
    switch(role) {
      case 'Docente': return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'Administrativo': return 'bg-gradient-to-br from-slate-400 to-slate-600';
      default: return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="w-full flex justify-center min-h-full">
      <div className="w-full max-w-[1400px] px-8 py-6 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 flex justify-between items-center">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <Users size={28} className="text-white/90"/>
                <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
             </div>
             <p className="text-blue-100 text-sm font-medium pl-10">Gestión centralizada de la comunidad educativa</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-inner">
             <p className="text-xs text-blue-100 uppercase font-bold tracking-wider mb-0.5">Total</p>
             <p className="text-3xl font-bold leading-none">{users.length}</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
           <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><XCircle size={16} /></button>}
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}><Grid3x3 size={20}/></button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}><List size={20}/></button>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} /> Nuevo
              </button>
           </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-20">
             <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 p-6">
             {filteredUsers.length > 0 ? (
               viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {paginatedUsers.map(user => (
                        <motion.div
                          key={user.id}
                          layout
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          onClick={() => setSelectedUser(user)}
                          className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all border border-gray-100 dark:border-slate-700 group relative"
                        >
                           <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 size={16} />
                           </button>

                           <div className="flex flex-col items-center gap-3">
                             <div className={`w-16 h-16 rounded-full ${getAvatarGradient(user.role)} flex items-center justify-center text-xl font-bold text-white mb-2`}>
                                {user.name.charAt(0)}
                             </div>
                             <div className="text-center">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate w-full">{user.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{user.role || 'Estudiante'}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{user.dni}</p>
                             </div>
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
               ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 border-b dark:border-slate-700">
                      <tr><th>Usuario</th><th>Rol</th><th>Email</th><th className="text-right">Acciones</th></tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map(user => (
                        <tr key={user.id} className="border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 font-medium dark:text-white">{user.name}</td>
                          <td className="py-3 text-gray-500">{user.role}</td>
                          <td className="py-3 text-gray-500">{user.email}</td>
                          <td className="py-3 text-right flex justify-end gap-2">
                            <button onClick={() => setSelectedUser(user)} className="text-blue-500"><Eye size={18}/></button>
                            <button onClick={() => handleDelete(user.id)} className="text-red-500"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               )
             ) : (
               <div className="text-center py-10 text-gray-400">No se encontraron usuarios.</div>
             )}

             {/* Pagination Simple */}
             {filteredUsers.length > 0 && (
                <div className="flex justify-end gap-2 mt-6">
                   <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="p-2 border rounded disabled:opacity-50 dark:border-slate-700 dark:text-white"><ChevronLeft size={20}/></button>
                   <span className="py-2 px-4 dark:text-white">Página {currentPage}</span>
                   <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="p-2 border rounded disabled:opacity-50 dark:border-slate-700 dark:text-white"><ChevronRight size={20}/></button>
                </div>
             )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchUsers} />}
        {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>
    </div>
  );
}
