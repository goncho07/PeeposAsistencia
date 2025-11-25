"use client";

import { HeroHeader } from "@/components/app/hero-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const StatBox = ({ title, value, sublabel, icon: Icon, color }: any) => (
  <div className={`p-5 rounded-xl text-white ${color} relative overflow-hidden shadow-md`}>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className="opacity-90" />
        <span className="text-xs font-semibold opacity-90">{title}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-[11px] opacity-80">{sublabel}</div>
    </div>
    <Icon size={64} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
  </div>
);

const sectionsData = {
  Inicial: ['MARGARITAS_3AÑOS', 'CRISANTEMOS_3AÑOS', 'JASMINEZ_4AÑOS', 'ROSAS_4AÑOS', 'ORQUIDEAS_5AÑOS', 'TULIPANES_5AÑOS'],
  Primaria: ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'],
  Secundaria: ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'],
};

export default function ReportsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [formData, setFormData] = useState({ reportType: "Asistencia Mensual", levels: [] as string[], sections: [] as string[], format: "PDF" });

  const toggleLevel = (level: string) => { setFormData((prev) => { const newLevels = prev.levels.includes(level) ? prev.levels.filter((l) => l !== level) : [...prev.levels, level]; return { ...prev, levels: newLevels, sections: [] }; }); };
  const toggleSection = (section: string) => { setFormData((prev) => ({ ...prev, sections: prev.sections.includes(section) ? prev.sections.filter((s) => s !== section) : [...prev.sections, section] })); };

  const handleGenerate = () => {
    setStep(3);
    setLoading(true);
    setProgress(0);
    setReportGenerated(false);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setLoading(false); setReportGenerated(true); return 100; }
        return prev + 5;
      });
    }, 100);
  };

  const isNextDisabled = () => {
    if (step === 1 && formData.levels.length === 0) return true;
    return false;
  };
  
  useEffect(() => {
    setCurrentPage(1);
  }, [step]);
  
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="w-full flex justify-center bg-background min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader title="Reportes y Analíticos" subtitle="Exportación de datos institucionales y estadísticas detalladas" icon={BarChart3} gradient="bg-gradient-to-r from-purple-500 to-pink-600" decorativeIcon={FileText} />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="stats" {...pageVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatBox title="Estudiantes Activos" value="1,847" sublabel="Ciclo 2025" icon={Users} color="bg-gradient-to-br from-purple-500 to-purple-700" />
              <StatBox title="Promedio Mensual" value="94.2%" sublabel="Noviembre 2025" icon={TrendingUp} color="bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <StatBox title="Reportes Generados" value="127" sublabel="Último mes" icon={FileText} color="bg-gradient-to-br from-blue-500 to-blue-700" />
              <StatBox title="Alertas Pendientes" value="23" sublabel="Requieren atención" icon={AlertCircle} color="bg-gradient-to-br from-orange-400 to-orange-600" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-2xl shadow-sm border p-8">
          <div className="flex justify-center items-center gap-4 mb-12">
            {[ { id: 1, label: "Criterios" }, { id: 2, label: "Vista Previa" }, { id: 3, label: "Exportar" } ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s.id ? "bg-card border-2 border-primary text-primary shadow-sm" : step > s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {step > s.id ? <Check size={18} /> : s.id}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < 2 && <div className={`w-24 h-0.5 ${step > s.id ? "bg-primary/20" : "bg-muted"}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" {...pageVariants} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Tipo de reporte</label>
                        <Select value={formData.reportType} onValueChange={(value) => setFormData({...formData, reportType: value})}>
                            <SelectTrigger className="h-12"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Asistencia Diaria">Asistencia Diaria</SelectItem><SelectItem value="Asistencia Mensual">Asistencia Mensual</SelectItem><SelectItem value="Reporte Consolidado">Reporte Consolidado</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Período</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="date" className="w-full h-12 pl-10" /></div>
                            <div className="relative flex-1"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="date" className="w-full h-12 pl-10" /></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Nivel Educativo</label>
                        <div className="flex gap-3">{['Inicial', 'Primaria', 'Secundaria'].map(level => (<Button key={level} variant={formData.levels.includes(level) ? 'secondary' : 'outline'} onClick={() => toggleLevel(level)} className="flex-1 h-12">{level}</Button>))}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Formato de Archivo</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ id: 'PDF', icon: FileText, color: 'text-red-500' }, { id: 'Excel', icon: FileSpreadsheet, color: 'text-green-600' }, { id: 'CSV', icon: Database, color: 'text-blue-500' }].map((fmt) => (
                                <div key={fmt.id} onClick={() => setFormData({...formData, format: fmt.id})} className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.format === fmt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}>
                                    <fmt.icon size={24} className={fmt.color} /><span className="text-xs font-bold text-foreground/80">{fmt.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {formData.levels.length > 0 && (
                  <div className="pt-6 border-t animate-in fade-in slide-in-from-top-4">
                    <label className="text-sm font-medium text-foreground/80 mb-4 block">Secciones Específicas ({formData.sections.length} seleccionadas)</label>
                    <ScrollArea className="max-h-[300px] bg-muted/30 p-4 rounded-xl border">
                      {formData.levels.map(level => (
                        <div key={level} className="mb-6 last:mb-0">
                          <h4 className="text-xs font-bold text-primary uppercase mb-3 sticky top-0 bg-muted/80 backdrop-blur-sm py-1 rounded">{level}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                            {(sectionsData[level as keyof typeof sectionsData] || []).map(sec => (
                              <Button key={sec} onClick={() => toggleSection(sec)} variant={formData.sections.includes(sec) ? 'default' : 'secondary'} size="sm" className="h-auto py-1 justify-start">
                                <Checkbox checked={formData.sections.includes(sec)} className="mr-2"/>
                                <span>{sec}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4"><Button variant="ghost" onClick={() => setStep(1)} className="px-6 py-3">Cancelar</Button><Button onClick={() => setStep(2)} disabled={isNextDisabled()} className="px-8 py-3 text-sm">Vista Previa <ArrowRight size={16} /></Button></div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" {...pageVariants} className="space-y-6">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-primary">{formData.reportType}</h3>
                        <p className="text-sm text-primary/80 mt-1">{formData.sections.length} secciones seleccionadas • Formato {formData.format}</p>
                    </div>
                    <Button variant="link" onClick={() => setStep(1)}>Editar Criterios</Button>
                </div>
                <div className="border rounded-xl overflow-hidden"><table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground"><tr className="border-b"><th className="px-4 py-3 text-left font-medium">Estudiante</th><th className="px-4 py-3 text-left font-medium">Sección</th><th className="px-4 py-3 text-left font-medium">Entrada</th><th className="px-4 py-3 text-center font-medium">Estado</th></tr></thead>
                    <tbody className="divide-y">{[1, 2, 3, 4, 5].map((_, i) => (<tr key={i}><td className="px-4 py-3 text-foreground font-medium">Estudiante Ejemplo {i + 1}</td><td className="px-4 py-3 text-muted-foreground">5A - Primaria</td><td className="px-4 py-3 text-foreground/80">07:45 AM</td><td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold">Presente</span></td></tr>))}</tbody>
                </table><div className="bg-muted/50 p-3 text-center text-xs text-muted-foreground border-t">Vista previa de las primeras 5 filas de 247 registros totales</div></div>
                <div className="flex justify-between pt-4"><Button variant="outline" onClick={() => setStep(1)} className="px-6 py-3">Atrás</Button><Button onClick={handleGenerate} className="px-8 py-3">Generar Reporte <FileText size={16} /></Button></div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" {...pageVariants} className="py-12 flex flex-col items-center text-center">
                {!reportGenerated ? (
                  <>
                    <div className="w-20 h-20 mb-6 relative flex items-center justify-center"><Loader2 size={60} className="text-primary animate-spin absolute" /><span className="text-xs font-bold text-primary">{progress}%</span></div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Generando reporte...</h3>
                    <p className="text-muted-foreground text-sm mb-8 max-w-md">Por favor espere mientras procesamos los datos.</p>
                    <Progress value={progress} className="w-64" />
                  </>
                ) : (
                  <div className="animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6"><Check size={40} strokeWidth={3} /></div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">¡Reporte Generado!</h3>
                    <p className="text-muted-foreground mb-8">El archivo <span className="font-mono bg-muted px-1 rounded">reporte_nov2025.{formData.format.toLowerCase()}</span> está listo.</p>
                    <div className="flex gap-4"><Button variant="default" size="lg" className="bg-green-600 hover:bg-green-700"><Download size={18} /> Descargar Ahora</Button><Button variant="outline" size="lg" onClick={() => { setStep(1); setReportGenerated(false); }}><RefreshCcw size={16} /> Nuevo Reporte</Button></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
