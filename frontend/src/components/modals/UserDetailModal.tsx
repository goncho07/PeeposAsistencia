import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, QrCode, Download } from 'lucide-react';

export interface UserProfile {
  id: number;
  type: 'Estudiante' | 'Docente' | 'Administrativo' | 'Apoderado';
  name: string;
  dni: string;
  email: string;
  phone?: string;
  status: 'ACTIVO' | 'INACTIVO' | 'Suspendido';
  section: string;
  level?: string;
  grade?: string;
  avatarGradient: string;
  roleOrGrade: string;
  academicLocation: string;
  avatarUrl?: string;

  aulaInfo?: {
    id: number;
    codigo: string;
    nombre_completo: string;
    docente_tutor?: string;
  } | null;
  studentCode?: string;
  edad?: number;
  aulasTutorizadas?: Array<{
    id: number;
    codigo: string;
    nombre_completo: string;
  }>;
  hijos?: Array<{
    id: number;
    nombre: string;
    aula: string;
  }>;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const UserDetailModal: React.FC<{ user: UserProfile | null; onClose: () => void }> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'qr'>('personal');
  if (!user) return null;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gray-50 dark:bg-slate-800 p-8 pb-20 border-b border-gray-100 dark:border-slate-700">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white shadow-sm transition-colors"><X size={20}/></button>
            <div className="flex flex-col items-center">
                <div className={`w-28 h-28 rounded-full ${user.avatarGradient} flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg border-4 border-white dark:border-slate-900`}>{user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0)}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{user.roleOrGrade} • {user.type}</p>
            </div>
        </div>
        <div className="flex border-b border-gray-100 dark:border-slate-700 px-8 -mt-12 relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl">
            {[{ id: 'personal', label: 'Información Personal' }, { id: 'academic', label: user.type === 'Estudiante' ? 'Académico' : 'Institucional' }, { id: 'qr', label: 'Código QR' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>{tab.label}</button>
            ))}
        </div>
        <div className="p-8 h-[350px] overflow-y-auto">
            {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">DNI</p><p className="text-gray-800 dark:text-gray-200 font-medium">{user.dni}</p></div>
                    <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p><p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-1"><Mail size={14} className="text-gray-400"/> {user.email}</p></div>
              <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800"><p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{user.status}</span></div>
                </div>
            )}
            {activeTab === 'qr' && (
                 <div className="flex flex-col items-center justify-center py-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 dark:border-slate-700 dark:bg-slate-800 shadow-inner mb-4"><QrCode size={150} className="text-gray-800 dark:text-white"/></div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><Download size={16}/> Descargar QR</button>
                 </div>
            )}
            {activeTab === 'academic' && <div className="text-gray-500 dark:text-gray-400 text-center py-8">Información académica detallada aquí.</div>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDetailModal;