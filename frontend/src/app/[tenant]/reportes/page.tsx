'use client';

import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { ToastContainer } from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { useTenant } from '@/app/contexts/TenantProvider';
import { FileText, Download, Loader2, Search, ChevronLeft, ChevronRight, Users, GraduationCap, PieChart as PieChartIcon } from 'lucide-react';
import { reportsService, ReportFilters, ReportData } from '@/lib/api/reports';
import { usersService } from '@/lib/api/users';
import { settingsService } from '@/lib/api/settings';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Classroom {
    id: number;
    full_name: string;
    level: string;
    grade: number;
    section: string;
    shift: string;
}

const COLORS = {
    'Presente': '#22c55e',
    'Tardanza': '#f97316',
    'Falta': '#ef4444',
    'Justificado': '#3b82f6',
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];

export default function ReportesPage() {
    const { tenant } = useTenant();
    const [filters, setFilters] = useState<ReportFilters>({
        period: 'daily',
        type: 'student',
        level: '',
        grade: undefined,
        section: '',
        shift: ''
    });
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeMonthIdx, setActiveMonthIdx] = useState(0);
    const [bimesterDates, setBimesterDates] = useState<Record<number, { inicio: string; fin: string }>>({});

    const { toasts, success, error: showError, removeToast } = useToast();

    useEffect(() => {
        loadClassrooms();
        loadBimesterDates();
    }, []);

    const loadClassrooms = async () => {
        try {
            const data = await usersService.getClassrooms();
            setClassrooms(data || []);
        } catch (err) {
            console.error('Error loading classrooms:', err);
        }
    };

    const loadBimesterDates = async () => {
        try {
            const settings = await settingsService.getAll();
            const dates: Record<number, { inicio: string; fin: string }> = {};
            for (let i = 1; i <= 4; i++) {
                dates[i] = {
                    inicio: settings.bimestres[`bimestre_${i}_inicio` as keyof typeof settings.bimestres],
                    fin: settings.bimestres[`bimestre_${i}_fin` as keyof typeof settings.bimestres]
                };
            }
            setBimesterDates(dates);
        } catch (err) {
            console.error('Error loading bimester dates:', err);
        }
    };

    const availableLevels = useMemo(() => {
        const levels = new Set(classrooms.map(c => c.level));
        return Array.from(levels).sort();
    }, [classrooms]);

    const availableGrades = useMemo(() => {
        if (!filters.level) return [];
        const grades = new Set(
            classrooms
                .filter(c => c.level === filters.level)
                .map(c => c.grade)
        );
        return Array.from(grades).sort((a, b) => a - b);
    }, [classrooms, filters.level]);

    const availableSections = useMemo(() => {
        if (!filters.level || !filters.grade) return [];
        const sections = new Set(
            classrooms
                .filter(c => c.level === filters.level && c.grade === filters.grade)
                .map(c => c.section)
        );
        return Array.from(sections).sort();
    }, [classrooms, filters.level, filters.grade]);

    const availableShifts = useMemo(() => {
        if (!filters.level) return [];
        const shifts = new Set(
            classrooms
                .filter(c => c.level === filters.level)
                .map(c => c.shift)
        );
        return Array.from(shifts).sort();
    }, [classrooms, filters.level]);

    // Calculate months in period for navigation
    const monthsInPeriod = useMemo(() => {
        if (filters.period === 'daily' || !reportData) return [];

        // Parse dates without timezone conversion
        const [startYear, startMonth, startDay] = reportData.period.from.split('-').map(Number);
        const [endYear, endMonth, endDay] = reportData.period.to.split('-').map(Number);

        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);

        const months = [];
        let current = new Date(startDate);

        while (current <= endDate) {
            const monthIdx = current.getMonth();
            const year = current.getFullYear();

            const firstDay = new Date(year, monthIdx, 1);
            const lastDay = new Date(year, monthIdx + 1, 0);

            const periodStart = firstDay < startDate ? startDate : firstDay;
            const periodEnd = lastDay > endDate ? endDate : lastDay;

            const days = [];
            for (let d = new Date(periodStart); d <= periodEnd; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                days.push({
                    day: d.getDate(),
                    weekday: DAY_LETTERS[dayOfWeek],
                    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
                    fullDate: d.toISOString().split('T')[0]
                });
            }

            months.push({
                name: MONTH_NAMES[monthIdx],
                year: year,
                monthIdx: monthIdx,
                days: days
            });

            current.setMonth(current.getMonth() + 1);
            current.setDate(1);
        }

        return months;
    }, [reportData, filters.period]);

    const activeMonth = monthsInPeriod[activeMonthIdx] || monthsInPeriod[0];

    // Chart data
    const chartData = useMemo(() => {
        if (!reportData) return [];

        const stats = reportData.statistics;
        const data = [
            { name: 'Presente', value: stats.present, color: COLORS.Presente },
            { name: 'Tardanza', value: stats.late, color: COLORS.Tardanza },
            { name: 'Falta', value: stats.absent, color: COLORS.Falta },
            { name: 'Justificado', value: stats.justified_absences, color: COLORS.Justificado },
        ];

        return data.filter(d => d.value > 0);
    }, [reportData]);

    const handleGenerate = async () => {
        try {
            setIsLoading(true);
            setHasSearched(true);

            const payload: ReportFilters = {
                ...filters
            };

            if (filters.period === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                payload.from = today;
                payload.to = today;
            } else if (filters.period === 'monthly') {
                // selectedMonth is 0-indexed (0 = January, 10 = November)
                // For YYYY-MM format, we need 1-indexed (01 = January, 11 = November)
                const year = selectedYear;
                const monthStr = (selectedMonth + 1).toString().padStart(2, '0');

                // Get last day of the month
                // new Date(year, month+1, 0) gives last day of month
                // Example: new Date(2025, 11, 0) = Nov 30, 2025
                const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();

                payload.from = `${year}-${monthStr}-01`;
                payload.to = `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;

                console.log('Monthly report dates:', { selectedMonth, monthStr, from: payload.from, to: payload.to });
            } else if (filters.period === 'bimester' && filters.bimester) {
                const dates = bimesterDates[filters.bimester];
                payload.from = dates.inicio;
                payload.to = dates.fin;
            }

            const data = await reportsService.generateReport(payload);
            setReportData(data);
            console.log(data);
            setActiveMonthIdx(0);
            success('Reporte generado', 'Los datos se han cargado correctamente');
        } catch (err: any) {
            console.error('Error generating report:', err);
            showError('Error al generar reporte', err.response?.data?.message || 'No se pudo generar el reporte');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!reportData || !tenant) return;

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Generate filename based on filters and tenant
        const typeLabel = filters.type === 'student' ? 'Estudiantes' : 'Docentes';
        const periodLabel = filters.period === 'daily' ? 'Diario' :
                           filters.period === 'monthly' ? 'Mensual' :
                           `Bimestre${filters.bimester || ''}`;
        const dateStr = new Date().toISOString().split('T')[0];
        let filename = `${tenant.name}_${typeLabel}_${periodLabel}`;

        if (filters.level) filename += `_${filters.level}`;
        if (filters.grade) filename += `_${filters.grade}°`;
        if (filters.section) filename += `_${filters.section}`;
        filename += `_${dateStr}.pdf`;

        // Clean filename (remove invalid characters)
        filename = filename.replace(/[<>:"/\\|?*]/g, '_');

        if (filters.period === 'daily') {
            // Daily Report PDF - Manual table with consistent design
            // Header
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.3);
            doc.rect(10, 10, 277, 22);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(tenant.name.toUpperCase(), 148.5, 16, { align: 'center' });
            doc.setFontSize(10);
            doc.text("REGISTRO DE ASISTENCIA DIARIA", 148.5, 22, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`TIPO: ${filters.type === 'student' ? 'ESTUDIANTES' : 'DOCENTES'}`, 15, 28);
            if (filters.level) doc.text(`NIVEL: ${filters.level}`, 90, 28);
            if (filters.grade) doc.text(`GRADO: ${filters.grade}°`, 140, 28);
            if (filters.section) doc.text(`SECCIÓN: ${filters.section}`, 180, 28);
            doc.text(`FECHA: ${reportData.period.from}`, 230, 28);

            // Table
            const startY = 38;
            const indexW = 10;
            const nameW = 100;
            const entryW = 25;
            const exitW = 25;
            const statusW = 117;  // Remaining width to fill page
            const rowHeight = 6;

            // Table header - light gray background
            doc.setFillColor(245, 245, 245);
            doc.rect(10, startY, 277, 10, 'F');
            doc.setDrawColor(150, 150, 150);
            doc.rect(10, startY, 277, 10, 'S');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);

            // Column headers
            let currentX = 10;
            doc.text("N°", currentX + indexW / 2, startY + 6, { align: 'center' });
            doc.line(currentX + indexW, startY, currentX + indexW, startY + 10);

            currentX += indexW;
            doc.text("APELLIDOS Y NOMBRES", currentX + 2, startY + 6);
            doc.line(currentX + nameW, startY, currentX + nameW, startY + 10);

            currentX += nameW;
            doc.text("ENTRADA", currentX + entryW / 2, startY + 6, { align: 'center' });
            doc.line(currentX + entryW, startY, currentX + entryW, startY + 10);

            currentX += entryW;
            doc.text("SALIDA", currentX + exitW / 2, startY + 6, { align: 'center' });
            doc.line(currentX + exitW, startY, currentX + exitW, startY + 10);

            currentX += exitW;
            doc.text("ESTADO", currentX + statusW / 2, startY + 6, { align: 'center' });

            // Table body
            let currentY = startY + 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);

            reportData.details.forEach((person, idx) => {
                // Check if we need a new page
                if (currentY > 185) {
                    doc.addPage();
                    currentY = 20;
                }

                const record = person.records[0];

                // Alternating row colors - very light gray
                if (idx % 2 === 1) {
                    doc.setFillColor(252, 252, 252);
                    doc.rect(10, currentY, 277, rowHeight, 'F');
                }

                doc.setDrawColor(150, 150, 150);
                doc.rect(10, currentY, 277, rowHeight, 'S');

                currentX = 10;

                // N°
                doc.setTextColor(0, 0, 0);
                doc.text(String(idx + 1), currentX + indexW / 2, currentY + 4, { align: 'center' });
                doc.line(currentX + indexW, currentY, currentX + indexW, currentY + rowHeight);

                currentX += indexW;

                // Name (truncate if too long)
                doc.text(person.name.substring(0, 50), currentX + 2, currentY + 4);
                doc.line(currentX + nameW, currentY, currentX + nameW, currentY + rowHeight);

                currentX += nameW;

                // Entry time
                doc.text(record?.entry_time || '-', currentX + entryW / 2, currentY + 4, { align: 'center' });
                doc.line(currentX + entryW, currentY, currentX + entryW, currentY + rowHeight);

                currentX += entryW;

                // Exit time
                doc.text(record?.exit_time || '-', currentX + exitW / 2, currentY + 4, { align: 'center' });
                doc.line(currentX + exitW, currentY, currentX + exitW, currentY + rowHeight);

                currentX += exitW;

                // Status with color
                let statusText = record?.entry_status || '-';
                let statusColor: [number, number, number] = [0, 0, 0];

                if (record) {
                    if (record.entry_status === 'COMPLETO') {
                        statusText = 'COMPLETO';
                        statusColor = [0, 150, 0];
                    } else if (record.entry_status === 'TARDANZA') {
                        statusText = 'TARDANZA';
                        statusColor = [249, 115, 22];
                    } else if (record.entry_status === 'FALTA') {
                        statusText = 'FALTA';
                        statusColor = [239, 68, 68];
                    } else if (record.entry_status === 'FALTA_JUSTIFICADA') {
                        statusText = 'JUSTIFICADO';
                        statusColor = [59, 130, 246];
                    }
                }

                doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                doc.setFont("helvetica", "bold");
                doc.text(statusText, currentX + statusW / 2, currentY + 4, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "normal");

                currentY += rowHeight;
            });

            // Footer
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(`Impreso: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`, 148.5, currentY + 10, { align: 'center' });
        } else {
            // Monthly/Bimester Report PDF - Matrix table
            if (!activeMonth) return;

            monthsInPeriod.forEach((m, pageIdx) => {
                if (pageIdx > 0) doc.addPage();

                // Header
                doc.setDrawColor(100, 100, 100);
                doc.setLineWidth(0.3);
                doc.rect(10, 10, 277, 22);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(tenant.name.toUpperCase(), 148.5, 16, { align: 'center' });
                doc.setFontSize(10);
                doc.text("REGISTRO DE ASISTENCIA", 148.5, 22, { align: 'center' });

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(`TIPO: ${filters.type === 'student' ? 'ESTUDIANTES' : 'DOCENTES'}`, 15, 28);
                if (filters.level) doc.text(`NIVEL: ${filters.level}`, 90, 28);
                if (filters.grade) doc.text(`GRADO: ${filters.grade}°`, 140, 28);
                if (filters.section) doc.text(`SECCIÓN: ${filters.section}`, 180, 28);
                doc.text(`MES: ${m.name.toUpperCase()} ${m.year}`, 230, 28);

                // Table
                const startY = 38;
                const indexW = 10;
                const nameW = 80;
                const totalDays = m.days.length;
                const availableWidth = 277 - indexW - nameW;
                const dayW = availableWidth / totalDays;

                // Header row - lighter gray
                doc.setFillColor(245, 245, 245);
                doc.rect(10, startY, 277, 10, 'F');
                doc.setDrawColor(150, 150, 150);
                doc.rect(10, startY, 277, 10, 'S');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text("N°", 10 + indexW / 2, startY + 6, { align: 'center' });
                doc.text("APELLIDOS Y NOMBRES", 10 + indexW + 2, startY + 6);

                m.days.forEach((d: any, dIdx: number) => {
                    const dx = 10 + indexW + nameW + (dIdx * dayW);
                    doc.setDrawColor(150, 150, 150);
                    doc.line(dx, startY, dx, startY + 10);
                    if (d.isWeekend) {
                        doc.setFillColor(230, 230, 230);
                        doc.rect(dx, startY, dayW, 10, 'FD');
                    }
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(7);
                    doc.text(String(d.day), dx + dayW / 2, startY + 4, { align: 'center' });
                    doc.setFontSize(6);
                    doc.text(d.weekday, dx + dayW / 2, startY + 8, { align: 'center' });
                });

                // Body rows
                let currentY = startY + 10;
                const rowHeight = 6;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);

                reportData.details.forEach((person, sIdx) => {
                    if (currentY > 185) {
                        doc.addPage();
                        currentY = 20;
                    }

                    // Alternating row colors - very light gray
                    if (sIdx % 2 === 1) {
                        doc.setFillColor(252, 252, 252);
                        doc.rect(10, currentY, 277, rowHeight, 'F');
                    }
                    doc.setDrawColor(150, 150, 150);
                    doc.rect(10, currentY, 277, rowHeight, 'S');

                    doc.setTextColor(0, 0, 0);
                    doc.text(String(sIdx + 1), 10 + indexW / 2, currentY + 4, { align: 'center' });
                    doc.text(person.name.substring(0, 40), 10 + indexW + 2, currentY + 4);
                    doc.line(10 + indexW, currentY, 10 + indexW, currentY + rowHeight);
                    doc.line(10 + indexW + nameW, currentY, 10 + indexW + nameW, currentY + rowHeight);

                    m.days.forEach((d: any, dIdx: number) => {
                        const dx = 10 + indexW + nameW + (dIdx * dayW);
                        doc.setDrawColor(150, 150, 150);
                        doc.line(dx, currentY, dx, currentY + rowHeight);

                        if (d.isWeekend) {
                            doc.setFillColor(245, 245, 245);
                            doc.setDrawColor(150, 150, 150);
                            doc.rect(dx, currentY, dayW, rowHeight, 'FD');
                        } else {
                            const record = person.records.find(r => r.date === d.fullDate);
                            let val = '';
                            let color: [number, number, number] = [0, 100, 0];

                            if (record) {
                                if (record.entry_status === 'COMPLETO') {
                                    val = '.';
                                    color = [0, 150, 0];
                                } else if (record.entry_status === 'TARDANZA') {
                                    val = 'T';
                                    color = [249, 115, 22];
                                } else if (record.entry_status === 'FALTA') {
                                    val = 'F';
                                    color = [239, 68, 68];
                                } else if (record.entry_status === 'FALTA_JUSTIFICADA') {
                                    val = 'J';
                                    color = [59, 130, 246];
                                }

                                doc.setTextColor(color[0], color[1], color[2]);
                                doc.setFont("helvetica", "bold");
                                doc.text(val, dx + dayW / 2, currentY + 4, { align: 'center' });
                                doc.setTextColor(0, 0, 0);
                                doc.setFont("helvetica", "normal");
                            }
                        }
                    });

                    currentY += rowHeight;
                });

                // Footer legend
                const bottomY = 195;
                doc.setFontSize(7);
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "bold");
                doc.text(". Asistió   F Faltó   T Tardanza   J Falta justificada", 10, bottomY);
                doc.setFont("helvetica", "normal");
                doc.text(`Impreso: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`, 280, bottomY, { align: 'right' });
            });
        }

        doc.save(filename);
        success('PDF descargado', 'El archivo se descargó correctamente');
    };

    useEffect(() => {
        setHasSearched(false);
        setReportData(null);
        setActiveMonthIdx(0);
    }, [filters.period, filters.type]);

    return (
        <DashboardLayout>
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <HeroHeader
                title="Reportes de Asistencia"
                subtitle="Genera reportes detallados por periodo académico"
                icon={FileText}
                breadcrumbs={[
                    { label: 'Reportes', icon: FileText }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters Panel */}
                <div className="lg:col-span-1">
                    <div className="card space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <Search className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                            <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Filtros</h3>
                        </div>

                        {/* Period */}
                        <div className="form-group">
                            <label className="label">Periodo</label>
                            <select
                                value={filters.period}
                                onChange={(e) => setFilters({ ...filters, period: e.target.value as any, bimester: undefined })}
                                className="select"
                            >
                                <option value="daily">Diario</option>
                                <option value="monthly">Mensual</option>
                                <option value="bimester">Bimestral</option>
                            </select>
                        </div>

                        {/* Bimester selector */}
                        {filters.period === 'bimester' && (
                            <div className="form-group">
                                <label className="label">Bimestre</label>
                                <select
                                    value={filters.bimester || ''}
                                    onChange={(e) => setFilters({ ...filters, bimester: parseInt(e.target.value) })}
                                    className="select"
                                >
                                    <option value="">Seleccionar bimestre</option>
                                    {[1, 2, 3, 4].map(num => (
                                        <option key={num} value={num}>Bimestre {num}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Month selector */}
                        {filters.period === 'monthly' && (
                            <div className="form-group">
                                <label className="label">Mes y Año</label>
                                <input
                                    type="month"
                                    className="input"
                                    value={`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`}
                                    onChange={(e) => {
                                        const [year, month] = e.target.value.split('-');
                                        const yearNum = parseInt(year);
                                        const monthNum = parseInt(month) - 1; // Convert to 0-indexed
                                        console.log('Month selector changed:', { input: e.target.value, yearNum, monthNum, monthName: MONTH_NAMES[monthNum] });
                                        setSelectedYear(yearNum);
                                        setSelectedMonth(monthNum);
                                    }}
                                />
                            </div>
                        )}

                        {/* User Type */}
                        <div className="form-group">
                            <label className="label">Tipo de Usuario</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'student', label: 'Estudiantes', icon: Users },
                                    { value: 'teacher', label: 'Docentes', icon: GraduationCap }
                                ].map((option) => {
                                    const Icon = option.icon;
                                    const isActive = filters.type === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setFilters({ ...filters, type: option.value as any, level: '', grade: undefined, section: '', shift: '' })}
                                            className="p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1"
                                            style={{
                                                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                                                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent'
                                            }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                                            <span className="text-xs font-medium" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Level */}
                        <div className="form-group">
                            <label className="label">Nivel</label>
                            <select
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value, grade: undefined, section: '', shift: '' })}
                                className="select"
                            >
                                <option value="">Todos los niveles</option>
                                {availableLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Grade - Only for students */}
                        {filters.type === 'student' && filters.level && (
                            <div className="form-group">
                                <label className="label">Grado</label>
                                <select
                                    value={filters.grade || ''}
                                    onChange={(e) => setFilters({ ...filters, grade: e.target.value ? parseInt(e.target.value) : undefined, section: '' })}
                                    className="select"
                                >
                                    <option value="">Todos los grados</option>
                                    {availableGrades.map(grade => (
                                        <option key={grade} value={grade}>
                                            {filters.level === 'INICIAL' ? `${grade} años` : `${grade}°`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Section - Only for students */}
                        {filters.type === 'student' && filters.grade && (
                            <div className="form-group">
                                <label className="label">Sección</label>
                                <select
                                    value={filters.section}
                                    onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                                    className="select"
                                >
                                    <option value="">Todas las secciones</option>
                                    {availableSections.map(section => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Shift */}
                        {filters.level && (
                            <div className="form-group">
                                <label className="label">Turno</label>
                                <select
                                    value={filters.shift}
                                    onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
                                    className="select"
                                >
                                    <option value="">Todos los turnos</option>
                                    {availableShifts.map(shift => (
                                        <option key={shift} value={shift}>{shift.charAt(0) + shift.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="pt-4 space-y-3">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || (filters.period === 'bimester' && !filters.bimester)}
                                className="w-full py-3 px-4 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                    color: 'white',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Generar Reporte
                                    </>
                                )}
                            </button>

                            {hasSearched && reportData && (
                                <button
                                    onClick={handleDownloadPDF}
                                    className="w-full py-3 px-4 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 border-2"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'var(--color-primary)',
                                        color: 'var(--color-primary)'
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <div className="card min-h-[600px] flex flex-col">
                        {!hasSearched ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                <FileText className="w-20 h-20 mb-4 opacity-20" style={{ color: 'var(--color-text-secondary)' }} />
                                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Configura los filtros
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Selecciona los parámetros y presiona "Generar Reporte"
                                </p>
                            </div>
                        ) : !reportData ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--color-primary)' }} />
                            </div>
                        ) : (
                            <>
                                {/* Month Navigation - Only for bimester with multiple months */}
                                {filters.period === 'bimester' && monthsInPeriod.length > 1 && (
                                    <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                                        <button
                                            onClick={() => setActiveMonthIdx(prev => Math.max(0, prev - 1))}
                                            disabled={activeMonthIdx === 0}
                                            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text-primary)'
                                            }}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span className="hidden sm:inline">Anterior</span>
                                        </button>

                                        <div className="text-center">
                                            <h4 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                                {activeMonth?.name} {activeMonth?.year}
                                            </h4>
                                        </div>

                                        <button
                                            onClick={() => setActiveMonthIdx(prev => Math.min(monthsInPeriod.length - 1, prev + 1))}
                                            disabled={activeMonthIdx === monthsInPeriod.length - 1}
                                            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text-primary)'
                                            }}
                                        >
                                            <span className="hidden sm:inline">Siguiente</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Month Title - For monthly reports (single month, no navigation) */}
                                {filters.period === 'monthly' && activeMonth && (
                                    <div className="p-4 border-b text-center" style={{ borderColor: 'var(--color-border)' }}>
                                        <h4 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                            {activeMonth.name} {activeMonth.year}
                                        </h4>
                                    </div>
                                )}

                                <div className="flex-1 overflow-auto p-6">
                                    {/* Chart */}
                                    {chartData.length > 0 && (
                                        <div className="mb-6 rounded-xl overflow-hidden" style={{
                                            backgroundColor: 'var(--color-surface)',
                                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                                <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                    <PieChartIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                                    Distribución de Asistencia
                                                </h3>
                                            </div>
                                            <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-8">
                                                <div style={{ width: 200, height: 200 }}>
                                                    <ResponsiveContainer width={200} height={200}>
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                stroke="var(--color-surface)"
                                                                strokeWidth={2}
                                                            >
                                                                {chartData.map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {chartData.map((d: any) => (
                                                        <div key={d.name} className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="w-4 h-4 rounded" style={{ backgroundColor: d.color }}></span>
                                                                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                                                            </div>
                                                            <span className="text-2xl font-bold ml-6" style={{ color: 'var(--color-text-primary)' }}>{d.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Daily Report - Simple Table */}
                                    {filters.period === 'daily' && (
                                        <div className="rounded-xl overflow-hidden" style={{
                                            backgroundColor: 'var(--color-surface)',
                                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            <div className="overflow-x-auto">
                                                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                                                            <th className="p-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>N°</th>
                                                            <th className="p-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Apellidos y Nombres</th>
                                                            <th className="p-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Entrada</th>
                                                            <th className="p-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Salida</th>
                                                            <th className="p-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.details.map((person, idx) => {
                                                            const record = person.records[0];
                                                            return (
                                                                <tr key={person.id} style={{
                                                                    borderBottom: '1px solid var(--color-border)',
                                                                    backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)'
                                                                }}>
                                                                    <td className="p-4 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{idx + 1}</td>
                                                                    <td className="p-4 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{person.name}</td>
                                                                    <td className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{record?.entry_time || '-'}</td>
                                                                    <td className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{record?.exit_time || '-'}</td>
                                                                    <td className="p-4 text-center">
                                                                        <span className="px-3 py-1 rounded-full text-xs font-bold inline-block" style={{
                                                                            backgroundColor: record?.entry_status === 'COMPLETO' ? '#dcfce7' :
                                                                                          record?.entry_status === 'TARDANZA' ? '#fed7aa' :
                                                                                          record?.entry_status === 'FALTA' ? '#fee2e2' : '#dbeafe',
                                                                            color: record?.entry_status === 'COMPLETO' ? '#166534' :
                                                                                 record?.entry_status === 'TARDANZA' ? '#9a3412' :
                                                                                 record?.entry_status === 'FALTA' ? '#991b1b' : '#1e40af'
                                                                        }}>
                                                                            {record?.entry_status || '-'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Monthly/Bimester Report - Attendance Matrix */}
                                    {filters.period !== 'daily' && activeMonth && (
                                        <div className="rounded-xl overflow-hidden" style={{
                                            backgroundColor: 'var(--color-surface)',
                                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs min-w-full" style={{ borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                                                            <th className="p-2 text-center font-bold sticky left-0 z-20" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)', width: '50px', borderRight: '1px solid var(--color-border)' }}>#</th>
                                                            <th className="p-2 text-left px-4 font-bold sticky z-20" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)', minWidth: '200px', maxWidth: '250px', borderRight: '2px solid var(--color-border)', left: '30px' }}>
                                                                {filters.type === 'student' ? 'ESTUDIANTE' : 'DOCENTE'}
                                                            </th>
                                                            {activeMonth.days.map((d: any) => (
                                                                <th key={d.day} className="p-1 text-center" style={{
                                                                    backgroundColor: d.isWeekend ? 'var(--color-background)' : 'var(--color-background)',
                                                                    color: 'var(--color-text-secondary)',
                                                                    width: '36px',
                                                                    borderRight: '1px solid var(--color-border)',
                                                                    opacity: d.isWeekend ? 0.6 : 1
                                                                }}>
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <span className="text-sm font-bold">{d.day}</span>
                                                                        <span className="text-xs">{d.weekday}</span>
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.details.map((person, idx) => (
                                                            <tr key={person.id} style={{
                                                                borderBottom: '1px solid var(--color-border)',
                                                                backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)'
                                                            }}>
                                                                <td className="p-2 text-center font-bold sticky left-0 z-10" style={{
                                                                    backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)',
                                                                    color: 'var(--color-text-secondary)',
                                                                    borderRight: '1px solid var(--color-border)',
                                                                    width: '30px'
                                                                }}>{idx + 1}</td>
                                                                <td className="p-2 px-4 font-semibold sticky z-10 truncate" style={{
                                                                    backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)',
                                                                    color: 'var(--color-text-primary)',
                                                                    borderRight: '2px solid var(--color-border)',
                                                                    minWidth: '200px',
                                                                    maxWidth: '250px',
                                                                    left: '30px'
                                                                }}>{person.name}</td>
                                                                {activeMonth.days.map((d: any) => {
                                                                    const record = person.records.find(r => r.date === d.fullDate);
                                                                    let mark = '';
                                                                    let color = '#d1d5db';

                                                                    if (!d.isWeekend && record) {
                                                                        if (record.entry_status === 'COMPLETO') {
                                                                            mark = '.';
                                                                            color = '#16a34a';
                                                                        } else if (record.entry_status === 'TARDANZA') {
                                                                            mark = 'T';
                                                                            color = '#f97316';
                                                                        } else if (record.entry_status === 'FALTA') {
                                                                            mark = 'F';
                                                                            color = '#dc2626';
                                                                        } else if (record.entry_status === 'FALTA_JUSTIFICADA') {
                                                                            mark = 'J';
                                                                            color = '#3b82f6';
                                                                        }
                                                                    }

                                                                    return (
                                                                        <td key={d.day} className="p-1 text-center" style={{
                                                                            backgroundColor: d.isWeekend ? 'var(--color-background)' : (idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-background)'),
                                                                            borderRight: '1px solid var(--color-border)',
                                                                            width: '36px',
                                                                            opacity: d.isWeekend ? 0.6 : 1
                                                                        }}>
                                                                            {!d.isWeekend && mark && (
                                                                                <span className="font-bold text-base" style={{ color }}>{mark}</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Legend */}
                                    <div className="mt-6 rounded-xl overflow-hidden" style={{
                                        backgroundColor: 'var(--color-surface)',
                                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <div className="p-4 border-b" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                                            <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Simbología</h4>
                                        </div>
                                        <div className="p-4 flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac' }}>
                                                <span className="font-black text-xl" style={{ color: '#16a34a' }}>.</span>
                                                <span className="text-sm font-bold" style={{ color: '#166534' }}>ASISTIÓ</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                                                <span className="font-bold text-base" style={{ color: '#dc2626' }}>F</span>
                                                <span className="text-sm font-bold" style={{ color: '#991b1b' }}>FALTÓ</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#fed7aa', border: '1px solid #fdba74' }}>
                                                <span className="font-bold text-base" style={{ color: '#f97316' }}>T</span>
                                                <span className="text-sm font-bold" style={{ color: '#9a3412' }}>TARDANZA</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}>
                                                <span className="font-bold text-base" style={{ color: '#3b82f6' }}>J</span>
                                                <span className="text-sm font-bold" style={{ color: '#1e40af' }}>FALTA JUSTIFICADA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
