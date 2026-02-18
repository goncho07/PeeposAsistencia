import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/lib/api/reports';
import { ReportFilters } from './useReportFilters';
import { MonthData } from './useReportData';

const TYPE_LABELS: Record<string, string> = { student: 'Estudiantes', teacher: 'Docentes', user: 'Usuarios' };

export function useReportPDF() {
  const generatePDF = (
    reportData: ReportData,
    filters: ReportFilters,
    monthsInPeriod: MonthData[],
    tenantName: string
  ) => {
    if (!reportData) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const typeLabel = TYPE_LABELS[filters.type] ?? filters.type;
    const periodLabel =
      filters.period === 'daily'
        ? 'Diario'
        : filters.period === 'monthly'
          ? 'Mensual'
          : `Bimestre${filters.bimester || ''}`;
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `${tenantName}_${typeLabel}_${periodLabel}`;

    if (filters.level) filename += `_${filters.level}`;
    if (filters.grade) filename += `_${filters.grade}°`;
    if (filters.section) filename += `_${filters.section}`;
    filename += `_${dateStr}.pdf`;

    filename = filename.replace(/[<>:"/\\|?*]/g, '_');

    if (filters.period === 'daily') {
      generateDailyPDF(doc, reportData, filters, tenantName);
    } else {
      generateMonthlyPDF(doc, reportData, filters, monthsInPeriod, tenantName);
    }

    doc.save(filename);
  };

  const generateDailyPDF = (
    doc: jsPDF,
    reportData: ReportData,
    filters: ReportFilters,
    tenantName: string
  ) => {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.rect(10, 10, 277, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(tenantName.toUpperCase(), 148.5, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.text('REGISTRO DE ASISTENCIA DIARIA', 148.5, 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `TIPO: ${TYPE_LABELS[filters.type]?.toUpperCase() ?? filters.type.toUpperCase()}`,
      15,
      28
    );
    if (filters.level) doc.text(`NIVEL: ${filters.level}`, 90, 28);
    if (filters.grade) doc.text(`GRADO: ${filters.grade}°`, 140, 28);
    if (filters.section) doc.text(`SECCIÓN: ${filters.section}`, 180, 28);
    doc.text(`FECHA: ${reportData.period.from}`, 230, 28);

    const startY = 38;
    const indexW = 10;
    const nameW = 100;
    const entryW = 25;
    const exitW = 25;
    const statusW = 117;
    const rowHeight = 6;

    doc.setFillColor(245, 245, 245);
    doc.rect(10, startY, 277, 10, 'F');
    doc.setDrawColor(150, 150, 150);
    doc.rect(10, startY, 277, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    let currentX = 10;
    doc.text('N°', currentX + indexW / 2, startY + 6, { align: 'center' });
    doc.line(currentX + indexW, startY, currentX + indexW, startY + 10);

    currentX += indexW;
    doc.text('APELLIDOS Y NOMBRES', currentX + 2, startY + 6);
    doc.line(currentX + nameW, startY, currentX + nameW, startY + 10);

    currentX += nameW;
    doc.text('ENTRADA', currentX + entryW / 2, startY + 6, { align: 'center' });
    doc.line(currentX + entryW, startY, currentX + entryW, startY + 10);

    currentX += entryW;
    doc.text('SALIDA', currentX + exitW / 2, startY + 6, { align: 'center' });
    doc.line(currentX + exitW, startY, currentX + exitW, startY + 10);

    currentX += exitW;
    doc.text('ESTADO', currentX + statusW / 2, startY + 6, { align: 'center' });

    let currentY = startY + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    reportData.details.forEach((person, idx) => {
      if (currentY > 185) {
        doc.addPage();
        currentY = 20;
      }

      const record = person.records[0];

      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(10, currentY, 277, rowHeight, 'F');
      }

      doc.setDrawColor(150, 150, 150);
      doc.rect(10, currentY, 277, rowHeight, 'S');

      currentX = 10;

      doc.setTextColor(0, 0, 0);
      doc.text(String(idx + 1), currentX + indexW / 2, currentY + 4, {
        align: 'center',
      });
      doc.line(currentX + indexW, currentY, currentX + indexW, currentY + rowHeight);

      currentX += indexW;
      doc.text(person.name.substring(0, 50), currentX + 2, currentY + 4);
      doc.line(currentX + nameW, currentY, currentX + nameW, currentY + rowHeight);

      currentX += nameW;
      doc.text(record?.entry_time || '-', currentX + entryW / 2, currentY + 4, {
        align: 'center',
      });
      doc.line(currentX + entryW, currentY, currentX + entryW, currentY + rowHeight);

      currentX += entryW;
      doc.text(record?.exit_time || '-', currentX + exitW / 2, currentY + 4, {
        align: 'center',
      });
      doc.line(currentX + exitW, currentY, currentX + exitW, currentY + rowHeight);

      currentX += exitW;

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
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, currentX + statusW / 2, currentY + 4, {
        align: 'center',
      });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      currentY += rowHeight;
    });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Impreso: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`,
      148.5,
      currentY + 10,
      { align: 'center' }
    );
  };

  const generateMonthlyPDF = (
    doc: jsPDF,
    reportData: ReportData,
    filters: ReportFilters,
    monthsInPeriod: MonthData[],
    tenantName: string
  ) => {
    monthsInPeriod.forEach((m, pageIdx) => {
      if (pageIdx > 0) doc.addPage();

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.rect(10, 10, 277, 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(tenantName.toUpperCase(), 148.5, 16, { align: 'center' });
      doc.setFontSize(10);
      doc.text('REGISTRO DE ASISTENCIA', 148.5, 22, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `TIPO: ${TYPE_LABELS[filters.type]?.toUpperCase() ?? filters.type.toUpperCase()}`,
        15,
        28
      );
      if (filters.level) doc.text(`NIVEL: ${filters.level}`, 90, 28);
      if (filters.grade) doc.text(`GRADO: ${filters.grade}°`, 140, 28);
      if (filters.section) doc.text(`SECCIÓN: ${filters.section}`, 180, 28);
      doc.text(`MES: ${m.name.toUpperCase()} ${m.year}`, 230, 28);

      const startY = 38;
      const indexW = 10;
      const nameW = 80;
      const totalDays = m.days.length;
      const availableWidth = 277 - indexW - nameW;
      const dayW = availableWidth / totalDays;

      doc.setFillColor(245, 245, 245);
      doc.rect(10, startY, 277, 10, 'F');
      doc.setDrawColor(150, 150, 150);
      doc.rect(10, startY, 277, 10, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('N°', 10 + indexW / 2, startY + 6, { align: 'center' });
      doc.text('APELLIDOS Y NOMBRES', 10 + indexW + 2, startY + 6);

      m.days.forEach((d, dIdx) => {
        const dx = 10 + indexW + nameW + dIdx * dayW;
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

      let currentY = startY + 10;
      const rowHeight = 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      reportData.details.forEach((person, sIdx) => {
        if (currentY > 185) {
          doc.addPage();
          currentY = 20;
        }

        if (sIdx % 2 === 1) {
          doc.setFillColor(252, 252, 252);
          doc.rect(10, currentY, 277, rowHeight, 'F');
        }
        doc.setDrawColor(150, 150, 150);
        doc.rect(10, currentY, 277, rowHeight, 'S');

        doc.setTextColor(0, 0, 0);
        doc.text(String(sIdx + 1), 10 + indexW / 2, currentY + 4, {
          align: 'center',
        });
        doc.text(person.name.substring(0, 40), 10 + indexW + 2, currentY + 4);
        doc.line(10 + indexW, currentY, 10 + indexW, currentY + rowHeight);
        doc.line(
          10 + indexW + nameW,
          currentY,
          10 + indexW + nameW,
          currentY + rowHeight
        );

        m.days.forEach((d, dIdx) => {
          const dx = 10 + indexW + nameW + dIdx * dayW;
          doc.setDrawColor(150, 150, 150);
          doc.line(dx, currentY, dx, currentY + rowHeight);

          if (d.isWeekend) {
            doc.setFillColor(245, 245, 245);
            doc.setDrawColor(150, 150, 150);
            doc.rect(dx, currentY, dayW, rowHeight, 'FD');
          } else {
            const record = person.records.find((r) => r.date === d.fullDate);
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
              doc.setFont('helvetica', 'bold');
              doc.text(val, dx + dayW / 2, currentY + 4, { align: 'center' });
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'normal');
            }
          }
        });

        currentY += rowHeight;
      });

      const bottomY = 195;
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('. Asistió   F Faltó   T Tardanza   J Falta justificada', 10, bottomY);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Impreso: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`,
        280,
        bottomY,
        { align: 'right' }
      );
    });
  };

  return { generatePDF };
}
