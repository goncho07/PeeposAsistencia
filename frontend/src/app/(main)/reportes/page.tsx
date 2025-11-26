'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, TrendingUp, AlertCircle, Users, Check, ChevronDown, Calendar, FileSpreadsheet, Database, ArrowRight, Loader2, Download, RefreshCcw } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import StatBox from '@/components/ui/StatBox';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: "easeOut" }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
};

export default function ReportsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [formData, setFormData] = useState({ reportType: 'Asistencia Mensual', dateRange: { from: '', to: '' }, levels: [] as string[], sections: [] as string[], status: 'Todos', format: 'PDF' });
  
  const sectionsData = {
    'Inicial': {
      '3 Años': ['MARGARITAS_3AÑOS', 'CRISANTEMOS_3AÑOS'],
      '4 Años': ['JASMINEZ_4AÑOS', 'ROSAS_4AÑOS'],
      '5 Años': ['ORQUIDEAS_5AÑOS', 'TULIPANES_5AÑOS']
    },
    'Primaria': {
      '1er Grado': ['1A', '1B'],
      '2do Grado': ['2A', '2B'],
      '3er Grado': ['3A', '3B'],
      '4to Grado': ['4A', '4B'],
      '5to Grado': ['5A', '5B'],
      '6to Grado': ['6A', '6B']
    },
    'Secundaria': {
      '1er Año': ['1A', '1B'],
      '2do Año': ['2A', '2B'],
      '3er Año': ['3A', '3B'],
      '4to Año': ['4A', '4B'],
      '5to Año': ['5A', '5B']
    }
  };

  const toggleLevel = (level: string) => { setFormData(prev => ({ ...prev, levels: prev.levels.includes(level) ? prev.levels.filter(l => l !== level) : [...prev.levels, level] })); };
  const toggleSection = (section: string) => { setFormData(prev => ({ ...prev, sections: prev.sections.includes(section) ? prev.sections.filter(s => s !== section) : [...prev.sections, section] })); };
  const handleGenerate = () => { setStep(3); setLoading(true); setProgress(0); const interval = setInterval(() => { setProgress(prev => { if (prev >= 100) { clearInterval(interval); setLoading(false); setReportGenerated(true); return 100; } return prev + 5; }); }, 100); };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Reportes y Analíticos" subtitle="Exportación de datos institucionales y estadísticas detalladas" icon={BarChart3} gradient="bg-gradient-to-r from-purple-500 to-pink-600" decorativeIcon={FileText} />
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatBox title="Estudiantes Activos" value="1,847" sublabel="Ciclo 2025" icon={Users} color="bg-gradient-to-br from-purple-500 to-purple-700" />
            <StatBox title="Promedio Mensual" value="94.2%" sublabel="Noviembre 2025" icon={TrendingUp} color="bg-gradient-to-br from-emerald-400 to-emerald-600" />
            <StatBox title="Reportes Generados" value="127" sublabel="Último mes" icon={FileText} color="bg-gradient-to-br from-blue-500 to-blue-700" />
            <StatBox title="Alertas Pendientes" value="23" sublabel="Requieren atención" icon={AlertCircle} color="bg-gradient-to-br from-orange-400 to-orange-600" />
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <div className="flex justify-center items-center gap-4 mb-12">
            {[{ id: 1, label: "Criterios" }, { id: 2, label: "Vista Previa" }, { id: 3, label: "Exportar" }].map((s, i) => (
              <React.Fragment key={s.id}><div className="flex flex-col items-center gap-2"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s.id ? 'bg-white dark:bg-slate-800 border-2 border-purple-600 text-purple-600 shadow-sm' : step > s.id ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>{step > s.id ? <Check size={18} /> : s.id}</div><span className={`text-xs font-medium ${step === s.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>{s.label}</span></div>{i < 2 && <div className={`w-24 h-0.5 ${step > s.id ? 'bg-purple-200 dark:bg-purple-900' : 'bg-gray-100 dark:bg-slate-800'}`} />}</React.Fragment>
            ))}
          </div>
          {step === 1 && (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de reporte</label><div className="relative"><select className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 appearance-none dark:text-white" value={formData.reportType} onChange={(e) => setFormData({...formData, reportType: e.target.value})}><option>Asistencia Diaria</option><option>Asistencia Mensual</option><option>Reporte Consolidado</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</label><div className="flex gap-4"><div className="relative flex-1"><input type="date" className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-purple-500 dark:text-white" /><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /></div><div className="relative flex-1"><input type="date" className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-purple-500 dark:text-white" /><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /></div></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel Educativo</label><div className="flex gap-3">{['Inicial', 'Primaria', 'Secundaria'].map(level => (<button key={level} onClick={() => toggleLevel(level)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${formData.levels.includes(level) ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>{level}</button>))}</div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato de Archivo</label><div className="grid grid-cols-3 gap-3">{[{ id: 'PDF', icon: FileText, color: 'text-red-500' }, { id: 'Excel', icon: FileSpreadsheet, color: 'text-green-600' }, { id: 'CSV', icon: Database, color: 'text-blue-500' }].map((fmt) => (<div key={fmt.id} onClick={() => setFormData({...formData, format: fmt.id})} className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.format === fmt.id ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'}`}><fmt.icon size={24} className={fmt.color} /><span className="text-xs font-bold text-gray-700 dark:text-gray-300">{fmt.id}</span></div>))}</div></div>
              </div>
              {formData.levels.length > 0 && (
                <div className="pt-6 border-t border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">Secciones Específicas ({formData.sections.length} seleccionadas)</label>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                    {formData.levels.includes('Inicial') && (<div><h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-3 sticky top-0 bg-gray-50/95 dark:bg-slate-900/95 py-1">Nivel Inicial</h4><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">{Object.entries(sectionsData['Inicial']).map(([age, sections]) => sections.map(sec => (<button key={sec} onClick={() => toggleSection(sec)} className={`text-left px-3 py-2 rounded-md text-xs border truncate transition-colors ${formData.sections.includes(sec) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-purple-300'}`}>{sec} <span className="opacity-70 text-[10px] block">{age}</span></button>)))}</div></div>)}
                    {formData.levels.includes('Primaria') && (<div><h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 sticky top-0 bg-gray-50/95 dark:bg-slate-900/95 py-1">Nivel Primaria</h4><div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{Object.entries(sectionsData['Primaria']).map(([grade, sections]) => sections.map(sec => (<button key={sec} onClick={() => toggleSection(sec)} className={`text-center px-2 py-2 rounded-md text-xs border font-medium transition-colors ${formData.sections.includes(sec) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-blue-300'}`}>{sec}</button>)))}</div></div>)}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4"><button className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700">Cancelar</button><button onClick={() => setStep(2)} disabled={formData.sections.length === 0} className="px-8 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all">Vista Previa <ArrowRight size={16} /></button></div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
               <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 flex justify-between items-center"><div><h3 className="text-lg font-bold text-purple-900 dark:text-purple-300">{formData.reportType}</h3><p className="text-sm text-purple-700/80 dark:text-purple-400/80 mt-1">{formData.sections.length} secciones seleccionadas • Formato {formData.format}</p></div><button onClick={() => setStep(1)} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">Editar Criterios</button></div>
               <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700"><tr><th className="px-4 py-3 text-left font-medium">Estudiante</th><th className="px-4 py-3 text-left font-medium">Sección</th><th className="px-4 py-3 text-left font-medium">Entrada</th><th className="px-4 py-3 text-center font-medium">Estado</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800">{[1,2,3,4,5].map((_, i) => (<tr key={i} className="bg-white dark:bg-slate-900"><td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">Estudiante Ejemplo {i+1}</td><td className="px-4 py-3 text-gray-500 dark:text-gray-400">5A - Primaria</td><td className="px-4 py-3 text-gray-600 dark:text-gray-300">07:45 AM</td><td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold">Presente</span></td></tr>))}</tbody></table><div className="bg-gray-50 dark:bg-slate-800 p-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700">Vista previa de las primeras 5 filas de 247 registros totales</div></div>
               <div className="flex justify-between pt-4"><button onClick={() => setStep(1)} className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">Atrás</button><button onClick={handleGenerate} className="px-8 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2">Generar Reporte <FileText size={16} /></button></div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div variants={pageVariants} initial="initial" animate="animate" className="py-12 flex flex-col items-center text-center">
               {!reportGenerated ? (
                 <><div className="w-20 h-20 mb-6 relative flex items-center justify-center"><Loader2 size={60} className="text-purple-600 animate-spin absolute" /><span className="text-xs font-bold text-purple-600">{progress}%</span></div><h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Generando reporte...</h3><p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md">Por favor espere mientras procesamos los datos.</p><div className="w-64 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden"><motion.div className="h-full bg-purple-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div></>
               ) : (
                 <><div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 animate-in zoom-in"><Check size={40} strokeWidth={3} /></div><h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Reporte Generado!</h3><p className="text-gray-500 dark:text-gray-400 mb-8">El archivo <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 rounded">reporte_nov2025.{formData.format.toLowerCase()}</span> está listo.</p><div className="flex gap-4"><button onClick={() => {}} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-2"><Download size={18} /> Descargar Ahora</button><button onClick={() => { setStep(1); setReportGenerated(false); }} className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"><RefreshCcw size={16} /> Nuevo Reporte</button></div></>
               )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}