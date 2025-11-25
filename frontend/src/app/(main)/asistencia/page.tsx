'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, UserCheck, Search, Filter, Clock } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import api from '@/lib/axios';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Cargar datos
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get('/attendance').catch(() => ({ data: [] }));
        setRecords(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const studentName = record.user?.name || 'Desconocido';
      const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Mapear status del backend (inglés) a frontend (español) si es necesario, 
      // o asumir que el backend envía 'present', 'late', 'absent'
      const statusMap: Record<string, string> = { 'present': 'Presente', 'late': 'Tardanza', 'absent': 'Ausente' };
      const recordStatus = statusMap[record.status] || record.status;
      
      const matchesFilter = filterStatus === 'Todos' || recordStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus, records]);

  return (
    <div className="w-full flex justify-center min-h-full">
      <div className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Gestión de Asistencia" subtitle="Control de entradas y salidas" icon={ClipboardCheck} gradient="bg-gradient-to-r from-indigo-500 to-purple-600" decorativeIcon={UserCheck} />
        
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-12 pr-4 h-[48px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[10px] outline-none focus:border-blue-500 dark:text-white" 
            />
          </div>
          <div className="relative">
             <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 h-[48px] px-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors text-gray-700 dark:text-white">
               <Filter size={20} className="text-gray-500" />
               {filterStatus}
             </button>
             {isFilterOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden">
                 {['Todos', 'Presente', 'Tardanza', 'Ausente'].map((status) => (
                   <button key={status} onClick={() => { setFilterStatus(status); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-white transition-colors">{status}</button>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden min-h-[300px]">
          <div className="flex bg-gray-50 dark:bg-slate-800 px-6 py-4 border-b border-gray-100 dark:border-slate-700 font-semibold text-gray-500 dark:text-gray-400 text-sm">
             <div className="w-[35%]">Estudiante</div>
             <div className="w-[15%]">Grado</div>
             <div className="w-[15%]">Entrada</div>
             <div className="w-[15%]">Salida</div>
             <div className="w-[20%] text-center">Estado</div>
          </div>
          
          {loading ? (
             <div className="p-12 text-center text-gray-400">Cargando registros...</div>
          ) : filteredRecords.length > 0 ? (
             filteredRecords.map((record, i) => (
               <div key={i} className="flex px-6 py-4 items-center border-b border-gray-50 dark:border-slate-800 last:border-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-[35%] font-medium text-gray-800 dark:text-gray-200">{record.user?.name}</div>
                  <div className="w-[15%] text-gray-500">{record.section?.grade?.name || '-'}</div>
                  <div className="w-[15%] text-gray-600 dark:text-gray-300">{record.check_in || '--:--'}</div>
                  <div className="w-[15%] text-gray-400">{record.check_out || '--:--'}</div>
                  <div className="w-[20%] text-center">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold 
                        ${record.status === 'present' ? 'bg-green-100 text-green-700' : 
                          record.status === 'late' ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {record.status === 'present' ? 'Presente' : record.status === 'late' ? 'Tardanza' : 'Ausente'}
                     </span>
                  </div>
               </div>
             ))
          ) : (
             <div className="p-12 text-center text-gray-400">No hay registros para mostrar</div>
          )}
        </div>
      </div>
    </div>
  );
}
