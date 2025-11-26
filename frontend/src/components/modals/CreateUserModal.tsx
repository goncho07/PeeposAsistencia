import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, X, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

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

const EDUCATIONAL_STRUCTURE = {
  'Inicial': {
    grades: ['3 Años', '4 Años', '5 Años'],
    sections: SECTIONS_INICIAL
  },
  'Primaria': {
    grades: ['1ro Grado', '2do Grado', '3ro Grado', '4to Grado', '5to Grado', '6to Grado'],
    sections: SECTIONS_PRIMARIA
  },
  'Secundaria': {
    grades: ['1ro Año', '2do Año', '3ro Año', '4to Año', '5to Año'],
    sections: SECTIONS_SECUNDARIA
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

// Mapping frontend types to backend roles
const ROLE_MAP_BACKEND: Record<string, string> = {
  'Estudiante': 'student',
  'Docente': 'teacher',
  'Administrativo': 'admin',
  'Apoderado': 'parent'
};

const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    type: 'Estudiante',
    level: '',
    grade: '',
    section: '',
    email: '', // Added email as it's required by backend
  });

  if (!isOpen) return null;

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, level: e.target.value, grade: '', section: '' });
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, grade: e.target.value, section: '' });
  };

  const getGrades = () => {
    return formData.level ? EDUCATIONAL_STRUCTURE[formData.level as keyof typeof EDUCATIONAL_STRUCTURE].grades : [];
  };

  const getSections = () => {
    return formData.level ? EDUCATIONAL_STRUCTURE[formData.level as keyof typeof EDUCATIONAL_STRUCTURE].sections : [];
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dni) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Construct payload matching backend expectations
      const payload = {
        name: formData.name,
        dni: formData.dni,
        role: ROLE_MAP_BACKEND[formData.type],
        email: formData.email || `${formData.dni}@peepos.edu.pe`, // Generate email if empty
        password: 'password', // Default password
        level: formData.level,
        grade: formData.grade,
        section: formData.section,
      };

      await api.post('/users', payload);
      alert("Usuario creado exitosamente");
      onClose(); // This will trigger refresh in parent component
    } catch (error) {
      console.error(error);
      alert("Error al crear usuario. Verifique los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 dark:bg-blue-700 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2"><User size={24}/> Nuevo Usuario</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Usuario</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                <option>Estudiante</option>
                <option>Docente</option>
                <option>Administrativo</option>
                <option>Apoderado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">DNI</label>
              <input type="text" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="12345678"/>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
             <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Apellidos y Nombres"/>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Opcional)</label>
             <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="correo@ejemplo.com"/>
          </div>

          {formData.type === 'Estudiante' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 space-y-3">
               <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide">Información Académica</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nivel</label>
                    <select value={formData.level} onChange={handleLevelChange} className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-sm mt-1 dark:text-white">
                      <option value="">Seleccionar</option>
                      {Object.keys(EDUCATIONAL_STRUCTURE).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Grado</label>
                    <select value={formData.grade} onChange={handleGradeChange} disabled={!formData.level} className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-sm mt-1 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:text-white">
                      <option value="">Seleccionar</option>
                      {getGrades().map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Sección</label>
                    <select value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} disabled={!formData.grade} className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md text-sm mt-1 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:text-white">
                      <option value="">Seleccionar</option>
                      {getSections().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
           <button onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
           <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2">
             {loading && <Loader2 size={16} className="animate-spin"/>}
             Guardar Usuario
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateUserModal;