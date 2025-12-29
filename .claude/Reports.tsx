import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Download, Filter, ChevronDown, Loader2, Search, ChevronLeft, ChevronRight, CheckCircle2, Layers, User, Briefcase, Shield, GraduationCap, FileSpreadsheet, PieChart as PieChartIcon } from 'lucide-react';
import { HeroHeader } from './Shared';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { EDUCATIONAL_STRUCTURE } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

// PRECISE PERIOD CONFIGURATION (2026)
const PERIODS = {
  'Día': { label: 'DIARIO', start: '2026-03-16', end: '2026-03-16' }, // Fecha dinámica
  'Mensual': { label: 'MENSUAL', start: '2026-03-01', end: '2026-03-31' }, // Mes dinámico
  'I Bimestre': { label: 'I BIMESTRE', start: '2026-03-16', end: '2026-05-15' },
  'II Bimestre': { label: 'II BIMESTRE', start: '2026-05-25', end: '2026-07-24' },
  'III Bimestre': { label: 'III BIMESTRE', start: '2026-08-10', end: '2026-10-09' },
  'IV Bimestre': { label: 'IV BIMESTRE', start: '2026-10-19', end: '2026-12-18' }
};

const MONTH_NAMES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];

// COLORES GRAFICO
const COLORS = {
  'Presente': '#22c55e', // Green (Legacy/Monthly)
  'ASISTIÓ': '#22c55e', // Green (Daily)
  'Tardanza': '#f97316', // Orange
  'Faltó': '#ef4444', // Red (Legacy/Monthly)
  'FALTÓ': '#ef4444', // Red (Daily)
  'Justificado': '#3b82f6', // Blue
  'Tardanza Just.': '#a855f7', // Purple
  'Ausente': '#ef4444' // Red alias
};

// MOCK DATABASES
const STUDENTS_NAMES = ["Matías Flores", "Sofía Vargas", "Liam Torres", "Valentina Ruiz", "Thiago Castro", "Camila Rojas", "Mateo Cruz", "Luciana Pavez", "Gabriel Soto", "Isabella Mendoza"];
const TEACHERS_DB = ["Carlos Mendoza (Matemáticas)", "Ana Ruiz (Comunicación)", "Jorge Chávez (Historia)", "Lucía Fernández (Ciencias)", "Roberto Gómez (Ed. Física)", "Patricia Alva (Inglés)"];
const ADMINS_DB = ["Secretaría General", "Dirección Académica", "Departamento de Psicología", "Soporte Técnico", "Logística y Mantenimiento"];

export const ReportsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState({ 
      reportType: 'I Bimestre' as string, 
      userType: 'Estudiante' as 'Estudiante' | 'Docente' | 'Administrativo',
      level: 'Primaria', 
      section: '',
      selectedDay: '2026-03-16',
      selectedMonth: 2, // Marzo (0-indexed)
      specificUserId: 'Todos' // Para filtrar docente/admin específico
  });

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);

  // --- DYNAMIC SECTIONS LOGIC (STUDENTS) ---
  const availableSections = useMemo(() => {
    const key = formData.level as keyof typeof EDUCATIONAL_STRUCTURE;
    return EDUCATIONAL_STRUCTURE[key]?.sections || [];
  }, [formData.level]);

  // Set default section when level changes
  useEffect(() => {
    if (formData.userType === 'Estudiante' && availableSections.length > 0 && !availableSections.includes(formData.section)) {
        setFormData(prev => ({ ...prev, section: availableSections[0] }));
    }
  }, [availableSections, formData.section, formData.userType]);


  // --- LOGIC TO CALCULATE RELEVANT DAYS PER MONTH WITHIN PERIOD ---
  const monthsInPeriod = useMemo(() => {
    if (formData.reportType === 'Día') return [];

    let startStr, endStr;

    if (formData.reportType === 'Mensual') {
        const y = 2026;
        const m = formData.selectedMonth;
        const lastDay = new Date(y, m + 1, 0).getDate();
        startStr = `${y}-${String(m+1).padStart(2, '0')}-01`;
        endStr = `${y}-${String(m+1).padStart(2, '0')}-${lastDay}`;
    } else {
        const period = PERIODS[formData.reportType as keyof typeof PERIODS];
        startStr = period.start;
        endStr = period.end;
    }

    const [sY, sM, sD] = startStr.split('-').map(Number);
    const [eY, eM, eD] = endStr.split('-').map(Number);

    const result = [];
    
    let currentY = sY;
    let currentM = sM - 1; 
    
    const endM = eM - 1;
    const endY = eY;

    let iterations = 0;
    while ((currentY < endY || (currentY === endY && currentM <= endM)) && iterations < 12) {
      const daysInMonth = new Date(currentY, currentM + 1, 0).getDate();
      
      let startDay = 1;
      let endDay = daysInMonth;

      if (currentY === sY && currentM === (sM - 1)) startDay = sD;
      if (currentY === endY && currentM === endM) endDay = eD;

      const days = [];
      for (let d = startDay; d <= endDay; d++) {
        const dateObj = new Date(currentY, currentM, d);
        const dayOfWeek = dateObj.getDay(); 
        days.push({
          day: d,
          weekday: DAY_LETTERS[dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6
        });
      }

      result.push({
        name: MONTH_NAMES[currentM],
        year: currentY,
        monthIdx: currentM,
        days: days
      });

      currentM++;
      if (currentM > 11) {
        currentM = 0;
        currentY++;
      }
      iterations++;
    }

    return result;
  }, [formData.reportType, formData.selectedMonth]);

  const activeMonth = monthsInPeriod[activeMonthIdx] || monthsInPeriod[0];

  useEffect(() => {
    setActiveMonthIdx(0);
    setHasSearched(false);
    setPreviewData([]);
  }, [formData.reportType, formData.selectedMonth, formData.userType]);

  // --- STATS CALCULATION ---
  const chartData = useMemo(() => {
    if (!previewData.length) return [];
    
    // Initial stats object with support for both Daily and Monthly keys
    const stats: Record<string, number> = {
        'Presente': 0,
        'ASISTIÓ': 0,
        'Faltó': 0,
        'FALTÓ': 0,
        'Tardanza': 0,
        'Justificado': 0,
        'Tardanza Just.': 0
    };

    if (formData.reportType === 'Día') {
        previewData.forEach(user => {
            if (user.status === 'ASISTIÓ') stats['ASISTIÓ']++;
            else if (user.status === 'FALTÓ') stats['FALTÓ']++;
            else if (user.status === 'Tardanza') stats['Tardanza']++;
            else if (user.status === 'Justificado') stats['Justificado']++;
        });
    } else {
        // For monthly/period, we count marks in the ACTIVE month visible
        if (!activeMonth) return [];
        previewData.forEach(user => {
            if (user.attendance) {
                Object.values(user.attendance).forEach((mark: any) => {
                    if (mark === '.') stats['Presente']++;
                    else if (mark === 'F') stats['Faltó']++;
                    else if (mark === 'T') stats['Tardanza']++;
                    else if (mark === 'J') stats['Justificado']++;
                    else if (mark === 'U') stats['Tardanza Just.']++;
                });
            }
        });
    }

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return [];

    return Object.entries(stats)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
            name,
            value,
            color: COLORS[name as keyof typeof COLORS] || '#9ca3af'
        }));
  }, [previewData, activeMonth, formData.reportType]);

  const handleQuery = () => {
    setIsGenerating(true);
    setHasSearched(true);
    
    setTimeout(() => {
        const users = [];
        let sourceNames = [];

        if (formData.userType === 'Estudiante') {
            for(let i=0; i<20; i++) {
                const n1 = STUDENTS_NAMES[i % STUDENTS_NAMES.length].split(' ')[0];
                const n2 = STUDENTS_NAMES[i % STUDENTS_NAMES.length].split(' ')[1];
                sourceNames.push(`${n2} ${n1}, ${n1}`.toUpperCase());
            }
        } else if (formData.userType === 'Docente') {
            sourceNames = formData.specificUserId === 'Todos' 
                ? TEACHERS_DB 
                : [formData.specificUserId];
        } else {
            sourceNames = formData.specificUserId === 'Todos' 
                ? ADMINS_DB 
                : [formData.specificUserId];
        }

        for (let i = 0; i < sourceNames.length; i++) {
            const name = sourceNames[i];
            
            const attendanceMap: Record<number, string> = {};
            if (activeMonth) {
                activeMonth.days.forEach((d: any) => {
                    if (d.isWeekend) {
                        attendanceMap[d.day] = '';
                    } else {
                        const r = Math.random();
                        if (r > 0.92) attendanceMap[d.day] = 'F';
                        else if (r > 0.88) attendanceMap[d.day] = 'T';
                        else if (r > 0.85) attendanceMap[d.day] = 'J';
                        else if (r > 0.83) attendanceMap[d.day] = 'U';
                        else attendanceMap[d.day] = '.';
                    }
                });
            }

            users.push({
                id: i + 1,
                name: name.toUpperCase(),
                dni: `7${Math.floor(10000000 + Math.random() * 9000000)}`,
                timeIn: "07:45 AM",
                timeOut: "01:30 PM",
                // Updated status generation for Daily report
                status: Math.random() > 0.15 ? 'ASISTIÓ' : 'FALTÓ',
                attendance: attendanceMap
            });
        }
        
        if (formData.userType === 'Estudiante') {
             users.sort((a, b) => a.name.localeCompare(b.name));
        }

        setPreviewData(users);
        setIsGenerating(false);
    }, 600);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const periodLabel = formData.reportType === 'Mensual' 
        ? `MENSUAL - ${MONTH_NAMES[formData.selectedMonth]}` 
        : PERIODS[formData.reportType as keyof typeof PERIODS].label;

    monthsInPeriod.forEach((m, idx) => {
        if (idx > 0) doc.addPage();
        
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.3);
        doc.rect(10, 10, 277, 22);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("REGISTRO DE ASISTENCIA Y CONTROL", 148.5, 18, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        doc.text(`INSTITUCIÓN: FRANCISCO BOLOGNESI`, 15, 26);
        
        if (formData.userType === 'Estudiante') {
            doc.text(`NIVEL: ${formData.level.toUpperCase()}`, 90, 26);
            doc.text(`SECCIÓN: "${formData.section}"`, 140, 26);
        } else {
            doc.text(`PERSONAL: ${formData.userType.toUpperCase()}`, 90, 26);
            if (formData.userType === 'Docente') {
                 doc.text(`NIVEL: ${formData.level.toUpperCase()}`, 140, 26);
            }
        }

        doc.text(`PERIODO: ${periodLabel}`, 200, 26);
        doc.text(`MES: ${m.name}`, 250, 26);

        // --- Table Header ---
        const startY = 38;
        const indexW = 10;
        const nameW = 80;
        const totalDays = m.days.length;
        const availableWidth = 277 - indexW - nameW;
        const dayW = availableWidth / totalDays;

        doc.setFillColor(240, 240, 240);
        doc.rect(10, startY, 277, 10, 'F');
        doc.rect(10, startY, 277, 10, 'S');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("N°", 10 + indexW/2, startY + 6, { align: 'center' });
        doc.text("APELLIDOS Y NOMBRES", 10 + indexW + 2, startY + 6);

        m.days.forEach((d: any, dIdx: number) => {
            const dx = 10 + indexW + nameW + (dIdx * dayW);
            doc.line(dx, startY, dx, startY + 10);
            if (d.isWeekend) {
               doc.setFillColor(220, 220, 220);
               doc.rect(dx, startY, dayW, 10, 'F');
               doc.rect(dx, startY, dayW, 10, 'S');
            }
            doc.setFontSize(7);
            doc.text(String(d.day), dx + dayW/2, startY + 4, { align: 'center' });
            doc.setFontSize(6);
            doc.text(d.weekday, dx + dayW/2, startY + 8, { align: 'center' });
        });
        doc.line(10 + 277, startY, 10 + 277, startY + 10);

        // --- Table Body ---
        let currentY = startY + 10;
        const rowHeight = 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        previewData.forEach((student, sIdx) => {
            if (currentY > 185) {
                doc.addPage();
                currentY = 20;
            }

            if (sIdx % 2 === 1) {
                doc.setFillColor(250, 250, 250);
                doc.rect(10, currentY, 277, rowHeight, 'F');
            }
            doc.rect(10, currentY, 277, rowHeight, 'S');

            doc.text(String(sIdx + 1), 10 + indexW/2, currentY + 4, { align: 'center' });
            doc.text(student.name, 10 + indexW + 2, currentY + 4);
            doc.line(10 + indexW, currentY, 10 + indexW, currentY + rowHeight);
            doc.line(10 + indexW + nameW, currentY, 10 + indexW + nameW, currentY + rowHeight);

            m.days.forEach((d: any, dIdx: number) => {
                const dx = 10 + indexW + nameW + (dIdx * dayW);
                doc.line(dx, currentY, dx, currentY + rowHeight);
                
                if (d.isWeekend) {
                    doc.setFillColor(235, 235, 235);
                    doc.rect(dx, currentY, dayW, rowHeight, 'F');
                    doc.rect(dx, currentY, dayW, rowHeight, 'S');
                } else {
                    let val = '.';
                    const r = (sIdx + d.day * 13) % 100;
                    if (r > 92) val = 'F';
                    else if (r > 88) val = 'T';
                    else if (r > 85) val = 'J';
                    else if (r > 83) val = 'U';

                    let color = [0, 100, 0]; // Green
                    if (val === 'F') color = [200, 0, 0];
                    if (val === 'T') color = [255, 140, 0]; 
                    if (val === 'J') color = [0, 0, 200]; 
                    if (val === 'U') color = [100, 0, 200];

                    doc.setTextColor(color[0], color[1], color[2]);
                    doc.setFont("helvetica", "bold");
                    doc.text(val, dx + dayW/2, currentY + 4, { align: 'center' });
                    doc.setTextColor(0, 0, 0);
                    doc.setFont("helvetica", "normal");
                }
            });
            
            currentY += rowHeight;
        });

        const bottomY = 195;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(". Asistió   F Faltó   T Tardanza   J Falta justificada   U Tardanza justificada", 10, bottomY);
        doc.setFont("helvetica", "normal");
        doc.text(`Impreso: ${new Date().toLocaleDateString()} - Sistema Peepos`, 280, bottomY, { align: 'right' });
    });

    doc.save(`Asistencia_${formData.userType}_${periodLabel}.pdf`);
  };

  const handleDownloadExcel = () => {
    // Simple CSV Export Logic
    let csv = "N,APELLIDOS Y NOMBRES";
    
    // Add Days Header
    if (activeMonth) {
        activeMonth.days.forEach((d: any) => {
            csv += `,${d.day}/${d.weekday}`;
        });
    }
    csv += "\n";

    previewData.forEach((u, i) => {
        let row = `${i+1},"${u.name}"`;
        if (activeMonth) {
            activeMonth.days.forEach((d: any) => {
                const val = u.attendance ? u.attendance[d.day] || '' : (d.isWeekend ? '' : '.');
                row += `,${val}`;
            });
        }
        csv += row + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reporte_${formData.userType}_${formData.level || 'General'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full font-sans">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1400px] px-8 py-6 flex flex-col">
        <HeroHeader 
          title="Gestión de Reportes 2026" 
          subtitle="Generación automatizada de asistencia por periodos bimestrales, mensuales y diarios" 
          icon={FileText} 
          gradient="bg-gradient-to-r from-blue-700 to-indigo-900" 
          decorativeIcon={Calendar} 
        />

        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* CONFIG PANEL */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                        <Filter className="text-blue-600" size={20} />
                        <h3 className="font-bold text-gray-900 dark:text-white">Parámetros del Reporte</h3>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Tipo de Periodo */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Periodo Académico</label>
                            <div className="relative">
                                <select 
                                    className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                    value={formData.reportType}
                                    onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                                >
                                    {Object.keys(PERIODS).map(p => <option key={p} value={p}>{PERIODS[p as keyof typeof PERIODS].label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* 2. Selector de Fecha/Mes dinámico */}
                        {formData.reportType === 'Día' ? (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha Específica</label>
                                <div className="relative">
                                  <input 
                                      type="date" 
                                      onClick={(e) => e.currentTarget.showPicker()}
                                      className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 rounded-xl text-sm font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                      value={formData.selectedDay}
                                      onChange={(e) => setFormData({...formData, selectedDay: e.target.value})}
                                  />
                                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        ) : formData.reportType === 'Mensual' ? (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Seleccionar Mes (2026)</label>
                                <div className="relative">
                                  <select
                                      className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                      value={formData.selectedMonth}
                                      onChange={(e) => setFormData({...formData, selectedMonth: parseInt(e.target.value)})}
                                  >
                                      {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1">Duración Oficial</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Del {new Date(PERIODS[formData.reportType as keyof typeof PERIODS].start + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long' })} al {new Date(PERIODS[formData.reportType as keyof typeof PERIODS].end + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long' })}
                                </p>
                            </div>
                        )}

                        {/* 3. Selector de Tipo de Usuario */}
                        <div className="space-y-2">
                             <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Tipo de Usuario</label>
                             <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl h-16">
                                <button 
                                  onClick={() => setFormData(prev => ({ ...prev, userType: 'Estudiante' }))}
                                  className={`flex-1 rounded-xl text-xs font-bold flex flex-col justify-center items-center gap-0.5 transition-all ${formData.userType === 'Estudiante' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                  <GraduationCap size={16}/> Estudiante
                                </button>
                                <button 
                                  onClick={() => setFormData(prev => ({ ...prev, userType: 'Docente' }))}
                                  className={`flex-1 rounded-xl text-xs font-bold flex flex-col justify-center items-center gap-0.5 transition-all ${formData.userType === 'Docente' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                  <Briefcase size={16}/> Docente
                                </button>
                                <button 
                                  onClick={() => setFormData(prev => ({ ...prev, userType: 'Administrativo' }))}
                                  className={`flex-1 rounded-xl text-xs font-bold flex flex-col justify-center items-center gap-0.5 transition-all ${formData.userType === 'Administrativo' ? 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                  <Shield size={16}/> Admin
                                </button>
                             </div>
                        </div>

                        {/* 4. Filtros Condicionales (Nivel/Sección o Nombre) */}
                        <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                             {/* Nivel Filter for Both Student AND Teacher */}
                             {(formData.userType === 'Estudiante' || formData.userType === 'Docente') && (
                                <div className="space-y-2 mb-3">
                                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Nivel Académico</label>
                                   <select 
                                        className="w-full h-12 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.level}
                                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                                    >
                                        <option value="Inicial">Inicial</option>
                                        <option value="Primaria">Primaria</option>
                                        <option value="Secundaria">Secundaria</option>
                                    </select>
                                </div>
                             )}

                            {/* Section for Student */}
                            {formData.userType === 'Estudiante' && (
                                <div className="space-y-2">
                                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Sección</label>
                                   <div className="relative">
                                        <select 
                                            className="w-full h-12 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                            value={formData.section}
                                            onChange={(e) => setFormData({...formData, section: e.target.value})}
                                        >
                                            {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                                        </select>
                                        <Layers className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            )}

                            {/* Name Filter for Teachers/Admins */}
                            {formData.userType !== 'Estudiante' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Filtrar por Nombres</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full h-12 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                            value={formData.specificUserId}
                                            onChange={(e) => setFormData({...formData, specificUserId: e.target.value})}
                                        >
                                            <option value="Todos">Todos los {formData.userType}s</option>
                                            {(formData.userType === 'Docente' ? TEACHERS_DB : ADMINS_DB).map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 space-y-3">
                            <button onClick={handleQuery} disabled={isGenerating} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                                GENERAR REPORTE
                            </button>
                            
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={handleDownloadPDF} disabled={!hasSearched || previewData.length === 0} className="w-full h-14 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                                    <Download size={20}/> Descargar PDF
                                </button>
                                <button onClick={handleDownloadExcel} disabled={!hasSearched || previewData.length === 0} className="w-full h-14 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50">
                                    <FileSpreadsheet size={20}/> Descargar Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="w-full lg:w-2/3 flex flex-col">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden relative min-h-[600px]">
                    
                    {/* Month Pagination */}
                    {formData.reportType !== 'Día' && hasSearched && monthsInPeriod.length > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center h-24 shrink-0">
                            <button 
                                onClick={() => setActiveMonthIdx(prev => Math.max(0, prev - 1))}
                                disabled={activeMonthIdx === 0}
                                className="px-4 py-2 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all disabled:opacity-30 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400"
                            >
                                <ChevronLeft size={20}/> ANTERIOR
                            </button>
                            
                            <div className="flex flex-col items-center">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                    {activeMonth?.name} {activeMonth?.year}
                                </h4>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mt-1">
                                    {formData.reportType === 'Mensual' ? 'REPORTE MENSUAL' : PERIODS[formData.reportType as keyof typeof PERIODS].label}
                                </span>
                            </div>

                            <button 
                                onClick={() => setActiveMonthIdx(prev => Math.min(monthsInPeriod.length - 1, prev + 1))}
                                disabled={activeMonthIdx === monthsInPeriod.length - 1}
                                className="px-4 py-2 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all disabled:opacity-30 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400"
                            >
                                SIGUIENTE <ChevronRight size={20}/>
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto p-6 scrollbar-thin relative bg-white dark:bg-slate-900">
                        {!hasSearched ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-60">
                                <Layers size={80} className="mb-6 stroke-1" />
                                <p className="font-bold text-lg text-center px-6">Configure los filtros y presione "Generar Reporte"<br/>para visualizar la matriz de asistencia.</p>
                            </div>
                        ) : (
                            <>
                                {/* CHART SECTION */}
                                {chartData.length > 0 && (
                                    <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 rounded-[24px] p-6 border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1"><PieChartIcon size={18} className="text-blue-500"/> Distribución General</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Resumen de estados de asistencia del periodo visualizado.</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {chartData.map((d: any) => (
                                                    <div key={d.name} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                                                        <span>{d.name}: {d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-40 h-40 relative flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={60}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {chartData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-xl font-black text-gray-700 dark:text-white">
                                                    {Math.round((chartData.find((d: any) => d.name === 'Presente' || d.name === 'ASISTIÓ')?.value || 0) / chartData.reduce((a: any, b: any) => a + b.value, 0) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.reportType === 'Día' ? (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        
                                        {/* TABLE DIARIA */}
                                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[24px] overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                                                        <th className="p-4 text-left font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">Apellidos y Nombres</th>
                                                        <th className="p-4 text-left font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">ENTRADA</th>
                                                        <th className="p-4 text-left font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">SALIDA</th>
                                                        <th className="p-4 text-center font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-[10px]">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                                    {previewData.map(u => (
                                                        <tr key={u.id} className="hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${formData.userType === 'Estudiante' ? 'bg-blue-500' : formData.userType === 'Docente' ? 'bg-purple-500' : 'bg-slate-500'}`}>{u.name[0]}</div>
                                                                    {u.name}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">{u.timeIn}</td>
                                                            <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">{u.timeOut}</td>
                                                            <td className="p-4 text-center">
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.status === 'ASISTIÓ' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                    {u.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* SIMBOLOGÍA DIARIA */}
                                        <div className="mt-6 flex flex-wrap gap-4 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                            <div className="w-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Simbología Oficial</div>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-green-600 dark:text-green-400 font-black text-lg leading-none">.</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">ASISTIÓ</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-red-500 dark:text-red-400 font-bold text-sm">F</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">FALTÓ</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-orange-500 dark:text-orange-400 font-bold text-sm">T</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">TARDANZA</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-blue-500 dark:text-blue-400 font-bold text-sm">J</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">FALTA JUST.</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-purple-500 dark:text-purple-400 font-bold text-sm">U</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">TARDANZA JUST.</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500">
                                        {activeMonth && (
                                            <div className="border border-gray-200 dark:border-slate-700 rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
                                                <table className="w-full text-[10px] border-collapse min-w-[800px]">
                                                    <thead>
                                                        <tr className="bg-gray-100 dark:bg-slate-800 h-14">
                                                            <th className="border-r border-b border-gray-200 dark:border-slate-700 p-2 w-10 text-gray-900 dark:text-white font-bold sticky left-0 bg-gray-100 dark:bg-slate-800 z-10">#</th>
                                                            <th className="border-r border-b border-gray-200 dark:border-slate-700 p-2 w-64 text-left px-4 text-gray-900 dark:text-white font-bold sticky left-10 bg-gray-100 dark:bg-slate-800 z-10">
                                                                {formData.userType.toUpperCase()}
                                                            </th>
                                                            {activeMonth.days.map((d: any) => (
                                                                <th key={d.day} className={`border-r border-b border-gray-200 dark:border-slate-700 p-1 min-w-[28px] text-center ${d.isWeekend ? 'bg-gray-200 dark:bg-slate-700' : ''}`}>
                                                                    <div className="flex flex-col items-center justify-center h-full">
                                                                        <span className={`text-sm font-bold ${d.isWeekend ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{d.day}</span>
                                                                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">{d.weekday}</span>
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-slate-900">
                                                        {previewData.map((u, idx) => (
                                                            <tr key={u.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 h-9 transition-colors group">
                                                                <td className="border-r border-b border-gray-100 dark:border-slate-800 text-center font-bold text-gray-400 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 z-10">{idx + 1}</td>
                                                                <td className="border-r border-b border-gray-100 dark:border-slate-800 px-4 truncate font-bold text-gray-800 dark:text-gray-200 sticky left-10 bg-white dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 z-10">{u.name}</td>
                                                                {activeMonth.days.map((d: any) => {
                                                                    const val = u.attendance ? u.attendance[d.day] : (d.isWeekend ? '' : '.');
                                                                    let colorClass = "text-gray-300";
                                                                    if (val === '.') colorClass = "text-green-600 dark:text-green-500 font-black text-lg leading-none";
                                                                    if (val === 'F') colorClass = "text-red-500 dark:text-red-400 font-bold text-xs";
                                                                    if (val === 'T') colorClass = "text-orange-500 dark:text-orange-400 font-bold text-xs";
                                                                    if (val === 'J') colorClass = "text-blue-500 dark:text-blue-400 font-bold text-xs";
                                                                    if (val === 'U') colorClass = "text-purple-500 dark:text-purple-400 font-bold text-xs";
                                                                    
                                                                    return (
                                                                        <td key={d.day} className={`border-r border-b border-gray-100 dark:border-slate-800 text-center align-middle ${d.isWeekend ? 'bg-gray-50 dark:bg-slate-800/40' : ''}`}>
                                                                            {!d.isWeekend && <span className={colorClass}>{val}</span>}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <div className="mt-6 flex flex-wrap gap-4 p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                            <div className="w-full text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Simbología Oficial</div>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-green-600 dark:text-green-400 font-black text-lg leading-none">.</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">ASISTIÓ</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-red-500 dark:text-red-400 font-bold text-sm">F</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">FALTÓ</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-orange-500 dark:text-orange-400 font-bold text-sm">T</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">TARDANZA</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-blue-500 dark:text-blue-400 font-bold text-sm">J</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">FALTA JUST.</span></div>
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"><span className="text-purple-500 dark:text-purple-400 font-bold text-sm">U</span> <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">TARDANZA JUST.</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};