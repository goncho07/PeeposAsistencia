'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Check, Download, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';
import api from '@/lib/axios';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
};

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

export default function ReportsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({ reportType: 'monthly', format: 'PDF' });

  const handleGenerate = async () => {
    setStep(3);
    setLoading(true);
    setProgress(10);

    const interval = setInterval(() => {
       setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 200);

    try {
       const response = await api.post('/reports/generate', formData, { 
           responseType: 'blob'
       });
       
       const url = window.URL.createObjectURL(new Blob([response.data]));
       setReportUrl(url);

       setProgress(100);
    } catch (error) {
       console.error("Error generando reporte:", error);
       alert('Error generando reporte. Intente nuevamente.');
       setStep(1);
    } finally {
       setLoading(false);
       clearInterval(interval);
    }
  };

  return (
    <div className="w-full flex justify-center min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Reportes" subtitle="Exportación de datos" icon={BarChart3} gradient="bg-gradient-to-r from-purple-500 to-pink-600" decorativeIcon={FileText} />
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
           <div className="flex justify-center items-center gap-4 mb-12">
              {[1, 2, 3].map((s) => (
                 <React.Fragment key={s}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= s ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-200 text-gray-400'}`}>
                       {step > s ? <Check size={20}/> : s}
                    </div>
                    {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
                 </React.Fragment>
              ))}
           </div>

           {step === 1 && (
             <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto space-y-6">
                <h3 className="text-lg font-bold text-center dark:text-white">Configura tu reporte</h3>
                <div>
                   <label className="block text-sm font-medium mb-2 dark:text-gray-300">Tipo de Reporte</label>
                   <select className="w-full p-3 bg-gray-50 dark:bg-slate-800 border rounded-lg dark:border-slate-700 dark:text-white" value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})}>
                      <option value="daily">Asistencia Diaria</option>
                      <option value="monthly">Asistencia Mensual</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2 dark:text-gray-300">Formato</label>
                   <div className="flex gap-4">
                      {['PDF', 'Excel'].map(fmt => (
                         <button key={fmt} onClick={() => setFormData({...formData, format: fmt})} className={`flex-1 p-4 border rounded-xl font-bold transition-all ${formData.format === fmt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:text-gray-300'}`}>
                            {fmt}
                         </button>
                      ))}
                   </div>
                </div>
                <div className="pt-6 flex justify-end">
                   <button onClick={() => setStep(2)} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2">Siguiente <ArrowRight size={18}/></button>
                </div>
             </motion.div>
           )}

           {step === 2 && (
              <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto text-center space-y-6">
                 <h3 className="text-lg font-bold dark:text-white">Confirmar Generación</h3>
                 <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl text-left border dark:border-slate-700">
                    <p className="mb-2 dark:text-gray-300"><strong>Tipo:</strong> {formData.reportType}</p>
                    <p className="dark:text-gray-300"><strong>Formato:</strong> {formData.format}</p>
                 </div>
                 <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400">Atrás</button>
                    <button onClick={handleGenerate} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2">Generar Reporte <FileText size={18}/></button>
                 </div>
              </motion.div>
           )}

           {step === 3 && (
              <motion.div variants={pageVariants} initial="initial" animate="animate" className="flex flex-col items-center py-12">
                 {loading ? (
                    <>
                       <Loader2 size={64} className="text-purple-600 animate-spin mb-4" />
                       <h3 className="text-xl font-bold dark:text-white">Procesando... {progress}%</h3>
                    </>
                 ) : (
                    <>
                       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                          <Check size={40} strokeWidth={3} />
                       </div>
                       <h3 className="text-2xl font-bold mb-2 dark:text-white">¡Reporte Listo!</h3>
                       <p className="text-gray-500 mb-8">Tu archivo ha sido generado exitosamente.</p>
                       <div className="flex gap-4">
                          {reportUrl && (
                              <a href={reportUrl} download={`reporte.${formData.format.toLowerCase()}`} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg"><Download size={18}/> Descargar</a>
                          )}
                          <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:text-white dark:hover:bg-slate-800 flex items-center gap-2"><RefreshCcw size={16}/> Nuevo</button>
                       </div>
                    </>
                 )}
              </motion.div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
