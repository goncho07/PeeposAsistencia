'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, UserCheck, Search, Filter, Clock, X, Send, LogOut } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';

interface Student {
  id: number;
  name: string;
  grade: string;
  dni: string;
  timeIn: string;
  timeOut: string;
  status: 'Presente' | 'Tardanza' | 'Ausente';
  avatarColor?: string;
  guardianName?: string;
  guardianPhone?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
};

const StudentDetailModal: React.FC<{ student: Student | null; onClose: () => void }> = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-8 overflow-y-auto border-l dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalle del Estudiante</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400"><X size={24}/></button></div>
        <div className="flex flex-col items-center mb-8">
          <div className={`w-24 h-24 rounded-full ${student.avatarColor} flex items-center justify-center text-3xl font-bold mb-4 shadow-inner`}>{student.name.charAt(0)}{student.name.split(' ')[1]?.charAt(0)}</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">{student.name}</h3>
          <p className="text-gray-500 dark:text-gray-400">{student.grade}</p>
          <div className={`mt-3 px-4 py-1 rounded-full text-sm font-bold border ${student.status === 'Presente' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : student.status === 'Tardanza' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>{student.status}</div>
        </div>
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hora Entrada</p><div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200"><Clock size={16} className="text-blue-500"/> {student.timeIn}</div></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hora Salida</p><div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200"><LogOut size={16} className="text-orange-500"/> {student.timeOut}</div></div>
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"><Send size={18} /> Enviar Notificación</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const itemsPerPage = 5;

  const allStudents: Student[] = [
    { id: 1, name: "Matías Flores", grade: "5to Grado A", dni: "78901234", timeIn: "07:45 AM", timeOut: "--:--", status: "Presente", avatarColor: "bg-blue-100 text-blue-600" },
    { id: 2, name: "Sofía Vargas", grade: "4to Grado B", dni: "78901235", timeIn: "08:15 AM", timeOut: "--:--", status: "Tardanza", avatarColor: "bg-pink-100 text-pink-600" },
    { id: 3, name: "Liam Torres", grade: "6to Grado A", dni: "78901236", timeIn: "--:--", timeOut: "--:--", status: "Ausente", avatarColor: "bg-purple-100 text-purple-600" },
    { id: 4, name: "Valentina Ruiz", grade: "5to Grado A", dni: "78901237", timeIn: "07:50 AM", timeOut: "--:--", status: "Presente", avatarColor: "bg-teal-100 text-teal-600" },
    { id: 5, name: "Thiago Castro", grade: "3er Grado C", dni: "78901238", timeIn: "07:55 AM", timeOut: "--:--", status: "Presente", avatarColor: "bg-orange-100 text-orange-600" }
  ];

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.dni.includes(searchQuery);
      const matchesFilter = filterStatus === 'Todos' || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterClick = (status: string) => { setFilterStatus(status); setIsFilterOpen(false); setCurrentPage(1); };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Gestión de Asistencia" subtitle="Control y validación de registros de entrada y salida" icon={ClipboardCheck} gradient="bg-gradient-to-r from-indigo-500 to-purple-600" decorativeIcon={UserCheck} />
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-[400px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Buscar estudiante por nombre o DNI..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 h-[48px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[10px] text-[16px] dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" /></div>
          <div className="relative"><button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 h-[48px] px-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium transition-colors"><Filter size={20} className="text-gray-500" />{filterStatus === 'Todos' ? 'Filtros' : filterStatus}</button>{isFilterOpen && (<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden">{['Todos', 'Presente', 'Tardanza', 'Ausente'].map((status) => (<button key={status} onClick={() => handleFilterClick(status)} className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors">{status}</button>))}</div>)}</div>
        </div>
        <div className="flex justify-between items-center mb-6"><div className="flex flex-col gap-1"><span className="text-lg font-semibold text-gray-800 dark:text-white">Registro de Hoy</span><span className="text-base text-gray-500 dark:text-gray-400">20/11/2025</span></div><div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl text-blue-600 dark:text-blue-400 font-medium text-sm">{filteredStudents.length} registros</div></div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="flex bg-gray-50 dark:bg-slate-800 px-6 py-4 border-b border-gray-100 dark:border-slate-700"><div className="w-[35%] text-sm font-semibold text-gray-500 dark:text-gray-400">Estudiante</div><div className="w-[15%] text-sm font-semibold text-gray-500 dark:text-gray-400">Grado</div><div className="w-[15%] text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock size={14}/> Entrada</div><div className="w-[15%] text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock size={14}/> Salida</div><div className="w-[20%] text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Estado</div></div>
          <AnimatePresence mode="wait">{paginatedStudents.length > 0 ? (paginatedStudents.map((student) => (<motion.div key={student.id} variants={itemVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} onClick={() => setSelectedStudent(student)} className="flex px-6 py-4 items-center border-b border-gray-50 dark:border-slate-800 last:border-none hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"><div className="w-[35%] flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${student.avatarColor} flex items-center justify-center text-sm font-bold`}>{student.name.charAt(0)}{student.name.split(' ')[1]?.charAt(0)}</div><div><p className="text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</p><p className="text-xs text-gray-400 dark:text-gray-500">DNI: {student.dni}</p></div></div><div className="w-[15%] text-base text-gray-500 dark:text-gray-400">{student.grade}</div><div className={`w-[15%] text-base ${student.status === 'Tardanza' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-800 dark:text-gray-300'}`}>{student.timeIn}</div><div className="w-[15%] text-base text-gray-400 dark:text-gray-500">{student.timeOut}</div><div className="w-[20%] flex justify-center"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${student.status === 'Presente' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : student.status === 'Tardanza' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{student.status}</span></div></motion.div>))) : (<div className="p-12 text-center flex flex-col items-center text-gray-400"><Search size={48} className="mb-4 opacity-20" /><p>No se encontraron estudiantes</p></div>)}</AnimatePresence>
        </div>
        <AnimatePresence>{selectedStudent && (<StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />)}</AnimatePresence>
      </motion.div>
    </div>
  );
}