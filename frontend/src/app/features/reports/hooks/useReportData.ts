import { useState, useMemo } from 'react';
import {
  reportsService,
  ReportData,
} from '@/lib/api/reports';
import { ReportFilters } from './useReportFilters';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export interface MonthData {
  name: string;
  year: number;
  monthIdx: number;
  days: DayData[];
}

export interface DayData {
  day: number;
  weekday: string;
  isWeekend: boolean;
  fullDate: string;
}

export function useReportData() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);

  const monthsInPeriod = useMemo<MonthData[]>(() => {
    if (!reportData || !reportData.period) return [];

    const [startYear, startMonth, startDay] = reportData.period.from
      .split('-')
      .map(Number);
    const [endYear, endMonth, endDay] = reportData.period.to
      .split('-')
      .map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    const months: MonthData[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const monthIdx = current.getMonth();
      const year = current.getFullYear();

      const firstDay = new Date(year, monthIdx, 1);
      const lastDay = new Date(year, monthIdx + 1, 0);

      const periodStart = firstDay < startDate ? startDate : firstDay;
      const periodEnd = lastDay > endDate ? endDate : lastDay;

      const days: DayData[] = [];
      for (
        let d = new Date(periodStart);
        d <= periodEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfWeek = d.getDay();
        days.push({
          day: d.getDate(),
          weekday: DAY_LETTERS[dayOfWeek],
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          fullDate: d.toISOString().split('T')[0],
        });
      }

      months.push({
        name: MONTH_NAMES[monthIdx],
        year: year,
        monthIdx: monthIdx,
        days: days,
      });

      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
    }

    return months;
  }, [reportData]);

  const activeMonth = monthsInPeriod[activeMonthIdx] || monthsInPeriod[0];

  const chartData = useMemo(() => {
    if (!reportData) return [];

    const stats = reportData.statistics;
    const COLORS = {
      Presente: '#22c55e',
      Tardanza: '#f97316',
      Falta: '#ef4444',
      Justificado: '#3b82f6',
    };

    const data = [
      { name: 'Presente', value: stats.present, color: COLORS.Presente },
      { name: 'Tardanza', value: stats.late, color: COLORS.Tardanza },
      { name: 'Falta', value: stats.absent, color: COLORS.Falta },
      {
        name: 'Justificado',
        value: stats.justified_absences,
        color: COLORS.Justificado,
      },
    ];

    return data.filter((d) => d.value > 0);
  }, [reportData]);

  const generateReport = async (filtersWithDates: ReportFilters) => {
    try {
      setIsLoading(true);
      setHasSearched(true);

      const data = await reportsService.generateReport(filtersWithDates);
      setReportData(data);
      setActiveMonthIdx(0);

      return true;
    } catch (err: any) {
      console.error('Error generating report:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetReport = () => {
    setHasSearched(false);
    setReportData(null);
    setActiveMonthIdx(0);
  };

  return {
    reportData,
    isLoading,
    hasSearched,
    activeMonthIdx,
    setActiveMonthIdx,
    monthsInPeriod,
    activeMonth,
    chartData,
    generateReport,
    resetReport,
  };
}
