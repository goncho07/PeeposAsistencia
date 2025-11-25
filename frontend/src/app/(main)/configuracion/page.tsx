'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sliders, Building, Phone, User, Clock, Check, Globe } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import api from '@/lib/axios';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'school' | 'attendance'>('school');
  const [loading, setLoading] = useState(false);
  
  // Estados para formularios
  const [schoolForm, setSchoolForm] = useState({ name: '', address: '', director: '', phone: '' });
  const [attendanceForm, setAttendanceForm] = useState({ tardiness_limit: 5, timezone: 'America/Lima' });

  // Cargar configuración
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings').catch(() => ({ data: [] }));
        // Mapear array key-value a objeto
        const settingsMap: any = {};
        if (Array.isArray(data)) {
           data.forEach((s: any) => settingsMap[s.key] = s.value);
        }
        
        setSchoolForm({
          name: settingsMap['school_name'] || '',
          address: settingsMap['school_address'] || '',
          director: settingsMap['school_director'] || '',
          phone: settingsMap['school_phone'] || ''
        });
        
        setAttendanceForm({
          tardiness_limit: parseInt(settingsMap['attendance_tardiness_limit'] || '5'),
          timezone: settingsMap['attendance_timezone'] || 'America/Lima'
        });

      } catch (error) {
        console.error('Error loading settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (group: string) => {
    setLoading(true);
    try {
      const payload = group === 'school' 
        ? [
            { key: 'school_name', value: schoolForm.name },
            { key: 'school_address', value: schoolForm.address },
            { key: 'school_director', value: schoolForm.director },
            { key: 'school_phone', value: schoolForm.phone }
          ]
        : [
            { key: 'attendance_tardiness_limit', value: attendanceForm.tardiness_limit },
            { key: 'attendance_timezone', value: attendanceForm.timezone }
          ];

      await api.post('/settings/batch', { settings: payload }); // Asumimos endpoint batch update
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error guardando configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center min-h-full">
      <div className="w-full max-w-[1080px] px-8 py-8 flex flex-col">
        <HeroHeader title="Configuración" subtitle="Administración global" icon={Settings} gradient="bg-gradient-to-r from-slate-700 to-slate-900" decorativeIcon={Sliders} />
        
        <div className="grid grid-cols-2 gap-4 mb-8">
           <button onClick={() => setActiveTab('school')} className={`p-4 rounded-xl border-2 font-bold uppercase transition-all ${activeTab === 'school' ? 'border-blue-600 bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400' : 'border-gray-200 text-gray-400 dark:border-slate-800'}`}>Escuela</button>
           <button onClick={() => setActiveTab('attendance')} className={`p-4 rounded-xl border-2 font-bold uppercase transition-all ${activeTab === 'attendance' ? 'border-blue-600 bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400' : 'border-gray-200 text-gray-400 dark:border-slate-800'}`}>Asistencia</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8">
          <AnimatePresence mode="wait">
             {activeTab === 'school' && (
               <motion.div key="school" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="font-bold border-b pb-4 dark:text-white dark:border-slate-700">INFORMACIÓN INSTITUCIONAL</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300">Nombre Escuela</label>
                        <div className="relative"><Building className="absolute left-3 top-3 text-gray-400" size={18}/><input className="w-full pl-10 p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} /></div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300">Teléfono</label>
                        <div className="relative"><Phone className="absolute left-3 top-3 text-gray-400" size={18}/><input className="w-full pl-10 p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={schoolForm.phone} onChange={e => setSchoolForm({...schoolForm, phone: e.target.value})} /></div>
                     </div>
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium dark:text-gray-300">Dirección</label>
                        <input className="w-full p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={schoolForm.address} onChange={e => setSchoolForm({...schoolForm, address: e.target.value})} />
                     </div>
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium dark:text-gray-300">Director</label>
                        <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={18}/><input className="w-full pl-10 p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={schoolForm.director} onChange={e => setSchoolForm({...schoolForm, director: e.target.value})} /></div>
                     </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                     <button onClick={() => handleSave('school')} disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">Guardar Cambios</button>
                  </div>
               </motion.div>
             )}

             {activeTab === 'attendance' && (
               <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="font-bold border-b pb-4 dark:text-white dark:border-slate-700">REGLAS DE ASISTENCIA</h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300">Tolerancia Tardanza (minutos)</label>
                        <div className="relative max-w-xs"><Clock className="absolute left-3 top-3 text-gray-400" size={18}/><input type="number" className="w-full pl-10 p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={attendanceForm.tardiness_limit} onChange={e => setAttendanceForm({...attendanceForm, tardiness_limit: parseInt(e.target.value)})} /></div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium dark:text-gray-300">Zona Horaria</label>
                        <div className="relative max-w-xs"><Globe className="absolute left-3 top-3 text-gray-400" size={18}/><select className="w-full pl-10 p-3 bg-gray-50 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={attendanceForm.timezone} onChange={e => setAttendanceForm({...attendanceForm, timezone: e.target.value})}><option value="America/Lima">Lima (GMT-5)</option><option value="America/Bogota">Bogotá (GMT-5)</option></select></div>
                     </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                     <button onClick={() => handleSave('attendance')} disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">Guardar Reglas</button>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
