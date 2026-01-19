import { useState, useMemo, useEffect } from 'react';
import { usersService } from '@/lib/api/users';
import { settingsService } from '@/lib/api/settings';

export interface Classroom {
  id: number;
  full_name: string;
  level: string;
  grade: number;
  section: string;
  shift: string;
}

export interface ReportFilters {
  period: 'daily' | 'monthly' | 'bimester';
  type: 'student' | 'teacher';
  level: string;
  grade?: number;
  section: string;
  shift: string;
  bimester?: number;
  from?: string;
  to?: string;
}

export function useReportFilters() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'daily',
    type: 'student',
    level: '',
    grade: undefined,
    section: '',
    shift: '',
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [bimesterDates, setBimesterDates] = useState<
    Record<number, { inicio: string; fin: string }>
  >({});

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
          inicio:
            settings.bimestres[
              `bimestre_${i}_inicio` as keyof typeof settings.bimestres
            ],
          fin: settings.bimestres[
            `bimestre_${i}_fin` as keyof typeof settings.bimestres
          ],
        };
      }
      setBimesterDates(dates);
    } catch (err) {
      console.error('Error loading bimester dates:', err);
    }
  };

  const availableLevels = useMemo(() => {
    const levels = new Set(classrooms.map((c) => c.level));
    return Array.from(levels).sort();
  }, [classrooms]);

  const availableGrades = useMemo(() => {
    if (!filters.level) return [];
    const grades = new Set(
      classrooms.filter((c) => c.level === filters.level).map((c) => c.grade)
    );
    return Array.from(grades).sort((a, b) => a - b);
  }, [classrooms, filters.level]);

  const availableSections = useMemo(() => {
    if (!filters.level || !filters.grade) return [];
    const sections = new Set(
      classrooms
        .filter((c) => c.level === filters.level && c.grade === filters.grade)
        .map((c) => c.section)
    );
    return Array.from(sections).sort();
  }, [classrooms, filters.level, filters.grade]);

  const availableShifts = useMemo(() => {
    if (!filters.level) return [];
    const shifts = new Set(
      classrooms.filter((c) => c.level === filters.level).map((c) => c.shift)
    );
    return Array.from(shifts).sort();
  }, [classrooms, filters.level]);

  const getFiltersWithDates = (): ReportFilters => {
    const payload: ReportFilters = { ...filters };

    // Para 'daily', no enviamos from/to - el backend usará now() con su timezone
    if (filters.period === 'monthly') {
      const year = selectedYear;
      const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      payload.from = `${year}-${monthStr}-01`;
      payload.to = `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;
    } else if (filters.period === 'bimester' && filters.bimester) {
      const dates = bimesterDates[filters.bimester];
      payload.from = dates.inicio;
      payload.to = dates.fin;
    }

    return payload;
  };

  return {
    filters,
    setFilters,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    bimesterDates,
    availableLevels,
    availableGrades,
    availableSections,
    availableShifts,
    getFiltersWithDates,
  };
}
