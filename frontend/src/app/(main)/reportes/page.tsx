'use client';
import api from '@/lib/axios'; 
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { FileText, Calendar, Download, Filter, Search, Table, Loader2, ChevronDown, LogOut, Clock} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import HeroHeader from '@/components/ui/HeroHeader';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAulas } from '@/hooks/useAulas';
import { StatCard } from '@/components/ui/StatCard';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface ReportStatistics {
  present: number;
  late: number;
  absent: number;
  justified_absences: number;
}

export interface AttendanceRecord {
  date: string;
  entry_time: string | null;
  exit_time: string | null;
  entry_status: string | null;
  exit_status: string | null;
}

export interface ReportDetail {
  id: number;
  name: string;
  document: string;
  type: string;
  statistics: {
    total_days: number;
    present: number;
    late: number;
    absent: number;
    justified: number;
  };
  records: AttendanceRecord[];
}

export interface ReportResponse {
  period: { from: string; to: string; type: string };
  statistics: ReportStatistics;
  details: ReportDetail[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

function calculateAttendancePercentage(row: ReportDetail, reportPeriod: ReportResponse["period"]) {
  let totalPossible = 0;

  const countWeekdays = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let weekdays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) weekdays++;
    }

    return weekdays;
  };

  if (reportPeriod.type === "bimester") {
    totalPossible = 182 * 2;
  } else {
    const { from, to } = reportPeriod;
    const weekdays = countWeekdays(from, to);
    totalPossible = weekdays * 2;
  }

  const totalAsist = row.statistics.present + row.statistics.late;
  return totalPossible > 0
    ? Math.round((totalAsist / totalPossible) * 100)
    : 0;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    aulas,
    niveles,
    grados,
    secciones,
    setSelectedNivel,
    setSelectedGrado,
    setSelectedSeccion
  } = useAulas();

  const [filters, setFilters] = useState({
    period: 'daily',
    type: 'student',
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    bimester: 1,
    nivel: '',
    grado: '',
    seccion: ''
  });

  useEffect(() => {
    setSelectedNivel(filters.nivel);
    setSelectedGrado(filters.grado);
    setSelectedSeccion(filters.seccion);
  }, [filters.nivel, filters.grado, filters.seccion]);

  const tableData = useMemo(() => {
    if (!reportData?.details) return [];
    return reportData.details.filter(row =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.document.includes(searchQuery)
    );
  }, [reportData, searchQuery]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);

    try {
      const payload: any = {
        type: filters.type,
        period: filters.period,
      };

      if (filters.period === 'custom') {
        payload.from = filters.from;
        payload.to = filters.to;
      }
      if (filters.period === 'bimester') {
        payload.bimester = filters.bimester;
      }
      if (filters.type === 'student') {
        if (filters.nivel) payload.nivel = filters.nivel;
        if (filters.grado) payload.grado = filters.grado;
        if (filters.seccion) payload.seccion = filters.seccion;
      }
      if (filters.type === 'teacher' && filters.nivel) {
        payload.nivel = filters.nivel;
      }

      const { data } = await api.post('/attendance/report', payload);
      console.log(data);
      setReportData(data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const isConsolidated = useMemo(() => {
    return reportData?.period.type !== 'daily';
  }, [reportData]);

  const chartData = useMemo(() => {
    if (!reportData?.statistics) return null;
    const { present, late, absent, justified_absences } = reportData.statistics;

    return {
      labels: ['Presente', 'Tardanza', 'Falta', 'Justificado'],
      datasets: [
        {
          data: [present, late, absent, justified_absences],
          backgroundColor: ['#22c55e', '#f97316', '#ef4444', '#3b82f6'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 2,
        },
      ],
    };
  }, [reportData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);

    doc.setFont("helvetica", "bold");
    doc.text("Peepos - Reporte de Asistencia", 14, 12);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const reportType = filters.period === 'daily'
      ? 'Reporte Diario'
      : filters.period === 'weekly'
        ? 'Reporte Semanal'
        : filters.period === 'monthly'
          ? 'Reporte Mensual'
          : filters.period === 'bimester'
            ? 'Reporte Bimestral'
            : 'Reporte Personalizado';

    const levelName = filters.nivel === 'INICIAL'
        ? 'Inicial'
        : filters.nivel === 'PRIMARIA'
          ? 'Primaria'
          : filters.nivel === 'SECUNDARIA'
            ? 'Secundaria'
            : 'Todos los niveles';

    const userType = filters.type === 'student' ? 'Estudiantes' : 'Docentes';

    const subTitle = `${reportType} de ${userType} - ${levelName}`;
    doc.text(subTitle, 14, 19);
    doc.text(`${reportData.period.from} / ${reportData.period.to}`, pageWidth - 14, 19, { align: 'right' });

    let yPos = 40;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte Detallado", 14, yPos);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);

    const parts = [];

    if (filters.grado) filters.nivel === 'INICIAL' ? parts.push(`Año: ${filters.grado}`) : parts.push(`Grado: ${filters.grado}°`);
    if (filters.seccion) parts.push(`Sección: ${filters.seccion}`);

    parts.push(`Total: ${reportData.details.length}`);
    const detailText = parts.join(" | ");
    doc.text(detailText, 14, 47);
    
    const stats = [
      { label: "Asistencias", val: reportData.statistics.present, color: [34, 197, 94] },
      { label: "Tardanzas", val: reportData.statistics.late, color: [249, 115, 22] },
      { label: "Faltas", val: reportData.statistics.absent, color: [239, 68, 68] },
      { label: "Justificadas", val: reportData.statistics.justified_absences, color: [59, 130, 246] },
    ];

    let xPos = 14;
    stats.forEach((stat) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(xPos, yPos + 10, 40, 20, 'FD');

      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.rect(xPos, yPos + 10, 2, 20, 'F');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(stat.label.toUpperCase(), xPos + 5, yPos + 17);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(String(stat.val), xPos + 5, yPos + 26);

      xPos += 45;
    });

    const isConsolidated = reportData?.period.type !== 'daily';
    let head = [];
    let body = [];

    if (!isConsolidated) {
      head = [['NOMBRE', 'DOCUMENTO', 'ENTRADA', 'SALIDA', 'ESTADO']];
      body = reportData.details.map((row) => {
        const targetDate = reportData.period.from;
        const record = row.records.find((r) => r.date === targetDate);

        const status =
          record?.entry_status === 'ASISTIO'
            ? 'Presente'
            : record?.entry_status === 'TARDANZA'
              ? 'Tardanza'
              : record?.entry_status === 'FALTA_JUSTIFICADA'
                ? 'Justificado'
                : 'Falta';

        const entry = record?.entry_time ?? '--:--';
        const exit = record?.exit_time ?? '--:--';

        return [row.name, row.document, entry, exit, status];
      });
    } else {
      head = [['NOMBRE', 'DOCUMENTO', 'ASIST', 'TARD', 'FALT', 'JUST', '%']];
      body = reportData.details.map((row) => {
        const percentage = reportData
          ? calculateAttendancePercentage(row, reportData.period)
          : 0;
      
        return [
          row.name,
          row.document,
          row.statistics.present,
          row.statistics.late,
          row.statistics.absent,
          row.statistics.justified,
          `${percentage}%`,
        ];
      });

    }
    
    autoTable(doc, {
      startY: yPos + 35,
      head,
      body,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
        textColor: [30, 41, 59],
      },
      margin: { left: 14, right: 14 },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: isConsolidated
        ? {
          0: { cellWidth: 60 },
          1: { halign: 'left' },
          2: { halign: 'left' },
          3: { halign: 'left' },
          4: { halign: 'left' },
          5: { halign: 'left' },
          6: { halign: 'left' },
        }
        : {
          0: { cellWidth: 60 },
          1: { halign: 'left' },
          2: { halign: 'left' },
          3: { halign: 'left' },
          4: { halign: 'left' },
        },
      didParseCell: function (data) {
        if (data.section === 'head') {
          data.cell.styles.lineWidth = { bottom: 0.1 };
          data.cell.styles.lineColor = [226, 232, 240];
        }

        if (isConsolidated && data.section === 'body') {
          const col = data.column.index;

          if (col === 2) data.cell.styles.textColor = [34, 197, 94];
          if (col === 3) data.cell.styles.textColor = [249, 115, 22];
          if (col === 4) data.cell.styles.textColor = [239, 68, 68];
          if (col === 5) data.cell.styles.textColor = [59, 130, 246];
          if (col === 6) {
            const raw = data.cell.raw ?? '';
            const pct = parseInt(String(raw).replace('%', '')) || 0;
            data.cell.styles.textColor = pct < 80 ? [239, 68, 68] : [34, 197, 94];
            data.cell.styles.fontStyle = 'bold';
          }
        }

        if (!isConsolidated && data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'Presente') data.cell.styles.textColor = [34, 197, 94];
          else if (val === 'Tardanza') data.cell.styles.textColor = [249, 115, 22];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      },
    });

    const safeLevel = filters.nivel
      ? filters.nivel.charAt(0).toUpperCase() + filters.nivel.slice(1).toLowerCase().replace(/\s+/g, '_')
      : 'Todos';
    const safeSection = filters.seccion ? `_${filters.seccion}` : '';
    const safePeriod =
      filters.period === 'daily'
        ? 'Diario'
        : filters.period === 'weekly'
          ? 'Semanal'
          : filters.period === 'monthly'
            ? 'Mensual'
            : filters.period === 'bimester'
              ? `Bimestre${filters.bimester}`
              : 'Personalizado';

    doc.save(`Reporte_${userType}_${safeLevel}${safeSection}_${safePeriod}.pdf`);
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1600px] px-6 py-6 flex flex-col h-full gap-6">

        <HeroHeader
          title="Generador de Reportes"
          subtitle="Analítica avanzada de asistencia escolar en tiempo real"
          icon={FileText}
          gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
          decorativeIcon={Calendar}
        />

        <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
          <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 sticky top-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-4">
                <Filter className="text-blue-600" size={20} />
                <h3 className="font-bold text-lg">Filtros</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Periodo</label>
                  <div className="relative">
                    <select
                      className="w-full h-11 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white appearance-none"
                      value={filters.period}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                    >
                      <option value="daily">Día Actual</option>
                      <option value="weekly">Esta Semana</option>
                      <option value="monthly">Este Mes</option>
                      <option value="bimester">Por Bimestre</option>
                      <option value="custom">Personalizado</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {filters.period === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Desde</label>
                      <input type="date" className="w-full h-10 px-2 bg-white border border-gray-200 rounded-lg text-xs" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Hasta</label>
                      <input type="date" className="w-full h-10 px-2 bg-white border border-gray-200 rounded-lg text-xs" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
                    </div>
                  </div>
                )}

                {filters.period === 'bimester' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bimestre</label>
                    <select className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm" value={filters.bimester} onChange={e => setFilters({ ...filters, bimester: parseInt(e.target.value) })}>
                      <option value={1}>I Bimestre</option>
                      <option value={2}>II Bimestre</option>
                      <option value={3}>III Bimestre</option>
                      <option value={4}>IV Bimestre</option>
                    </select>
                  </div>
                )}

                <hr className="border-gray-100 dark:border-slate-800" />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de Usuario</label>
                  <div className="flex gap-2">
                    {['student', 'teacher'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilters({ ...filters, type })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filters.type === type ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {type === 'student' ? 'Estudiantes' : 'Docentes'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nivel</label>
                    <select
                      className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs"
                      value={filters.nivel}
                      onChange={(e) => setFilters({ ...filters, nivel: e.target.value, grado: '', seccion: '' })}
                    >
                      <option value="">Todos los niveles</option>
                      {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  {filters.type === 'student' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Grado</label>
                        <select
                          className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50"
                          value={filters.grado}
                          onChange={(e) => setFilters({ ...filters, grado: e.target.value, seccion: '' })}
                          disabled={!filters.nivel}
                        >
                          <option value="">Todos</option>
                          {grados.map(g => <option key={g} value={g}>{g}°</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Sección</label>
                        <select
                          className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50"
                          value={filters.seccion}
                          onChange={(e) => setFilters({ ...filters, seccion: e.target.value })}
                          disabled={!filters.grado}
                        >
                          <option value="">Todas</option>
                          {secciones.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {loading ? "Procesando..." : "Generar Reporte"}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={!reportData}
                    className="w-full h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Download size={16} /> Exportar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col min-h-[600px]">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Table size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Vista Previa</h3>
                    {reportData && <p className="text-xs text-gray-500">Total: {reportData.details.length} registros</p>}
                  </div>
                </div>

                {reportData && (
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar persona..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 h-9 pl-9 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden relative flex flex-col">
                {loading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-blue-600">
                    <Loader2 size={40} className="animate-spin mb-2" />
                    <span className="text-sm font-semibold animate-pulse">Consultando datos...</span>
                  </div>
                )}

                {!reportData && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Filter size={32} className="opacity-50" /></div>
                    <h4 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">Configure su Reporte</h4>
                    <p className="text-sm max-w-xs text-gray-400">Seleccione los parámetros a la izquierda para visualizar la data.</p>
                  </div>
                )}

                {reportData && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="h-64 w-full p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-evenly gap-6">
                      <div className="relative w-60 h-60 sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-80 transition-all duration-300">

                        {chartData && <Doughnut data={chartData} options={chartOptions} />}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full sm:w-auto">
                        <StatCard
                          label="Presentes"
                          val={reportData.statistics.present}
                          color="bg-green-500"
                        />
                        <StatCard
                          label="Tardanzas"
                          val={reportData.statistics.late}
                          color="bg-orange-500"
                        />
                        <StatCard
                          label="Faltas"
                          val={reportData.statistics.absent}
                          color="bg-red-500"
                        />
                        <StatCard
                          label="Justificadas"
                          val={reportData.statistics.justified_absences}
                          color="bg-blue-500"
                        />
                        <StatCard
                          label="Total Registros"
                          val={reportData.statistics.present +
                            reportData.statistics.late +
                            reportData.statistics.absent +
                            reportData.statistics.justified_absences}
                          color="bg-slate-500"
                        />
                        <StatCard
                          label="Total Personas"
                          val={reportData.details.length}
                          color="bg-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">Nombre</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">Documento</th>

                            {!isConsolidated ? (
                              <>
                                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">Entrada</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">Salida</th>
                                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 text-center">Estado</th>
                              </>
                            ) : (
                              <>
                                  <th className="px-5 py-3 text-xs font-bold text-green-600 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">Asist</th>
                                  <th className="px-5 py-3 text-xs font-bold text-orange-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">Tard</th>
                                  <th className="px-5 py-3 text-xs font-bold text-red-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">Falt</th>
                                  <th className="px-5 py-3 text-xs font-bold text-blue-500 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">Just</th>
                                  <th className="px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 text-center">%</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                          {tableData.length > 0 ? (
                            tableData.map((row) => {
                              const percentage = reportData
                                ? calculateAttendancePercentage(row, reportData.period)
                                : 0;

                              return (
                                <tr
                                  key={row.id}
                                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  <td className="px-5 py-3">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                      {row.name}
                                    </span>
                                  </td>

                                  <td className="px-5 py-3 text-center">
                                    <span className="text-xs text-gray-400">{row.document}</span>
                                  </td>

                                  {!isConsolidated ? (
                                    (() => {
                                      const targetDate = reportData?.period.from;
                                      const record = row.records.find((r) => r.date === targetDate);

                                      const status =
                                        record?.entry_status === 'ASISTIO'
                                          ? 'Presente'
                                          : record?.entry_status === 'TARDANZA'
                                            ? 'Tardanza'
                                            : record?.entry_status === 'FALTA_JUSTIFICADA'
                                              ? 'Justificado'
                                              : 'Falta';

                                      const statusClass =
                                        status === 'Presente'
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : status === 'Tardanza'
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                            : status === 'Justificado'
                                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

                                      return (
                                        <>
                                          <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                              <Clock
                                                size={14}
                                                className={
                                                  status === 'Tardanza'
                                                    ? 'text-orange-500'
                                                    : 'text-gray-400'
                                                }
                                              />
                                              {record?.entry_time ?? '-'}
                                            </div>
                                          </td>

                                          <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                              <LogOut size={14} className="text-gray-400" />
                                              {record?.exit_time ?? '-'}
                                            </div>
                                          </td>

                                          <td className="px-5 py-3 text-center">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}`}
                                            >
                                              {status}
                                            </span>
                                          </td>
                                        </>
                                      );
                                    })()
                                  ) : (
                                    <>
                                      <td className="px-5 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                                        {row.statistics.present}
                                      </td>
                                      <td className="px-5 py-3 text-center font-medium text-orange-600 dark:text-orange-400">
                                        {row.statistics.late}
                                      </td>
                                      <td className="px-5 py-3 text-center font-medium text-red-600 dark:text-red-400">
                                        {row.statistics.absent}
                                      </td>
                                      <td className="px-5 py-3 text-center font-medium text-blue-600 dark:text-blue-400">
                                        {row.statistics.justified}
                                      </td>
                                        <td
                                          className={`px-5 py-3 text-center font-bold ${percentage < 80
                                              ? 'text-red-600 dark:text-red-400'
                                              : 'text-green-600 dark:text-green-400'
                                            }`}
                                        >
                                          {percentage}%
                                        </td>
                                    </>
                                  )}
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="text-center py-10 text-gray-400 dark:text-gray-500"
                              >
                                No se encontraron datos para los filtros aplicados.
                              </td>
                            </tr>
                          )}
                        </tbody>

                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const StatBadge = ({ label, val, color }: { label: string, val: number, color: string }) => (
  <div className="flex items-center gap-3 w-32">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-bold text-gray-400">{label}</span>
      <span className="text-lg font-bold leading-none">{val}</span>
    </div>
  </div>
);