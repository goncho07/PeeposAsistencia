import { useState, useMemo, useEffect } from 'react';
import { usersService } from '@/lib/api/users';
import { academicYearService } from '@/lib/api/academic-years';
import { settingsService } from '@/lib/api/settings';
import { AttendableType } from '@/lib/api/attendance';

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
  type: AttendableType;
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
  const [allowedTypes, setAllowedTypes] = useState<AttendableType[]>([]);
  const [bimesterDates, setBimesterDates] = useState<
    Record<number, { inicio: string; fin: string }>
  >({});

  useEffect(() => {
    loadClassrooms();
    loadBimesterDates();
    loadAllowedTypes();
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
      const academicYear = await academicYearService.getCurrent();
      const dates: Record<number, { inicio: string; fin: string }> = {};
      for (const bimester of academicYear.bimesters) {
        dates[bimester.number] = {
          inicio: bimester.start_date,
          fin: bimester.end_date,
        };
      }
      setBimesterDates(dates);
    } catch (err) {
      console.error('Error loading bimester dates:', err);
    }
  };

  const loadAllowedTypes = async () => {
    try {
      const types = await settingsService.getAttendableTypes();
      setAllowedTypes(types ?? ['student']);

      if (!types.includes(filters.type)) {
        setFilters((prev) => ({ ...prev, type: types[0] }));
      }
    } catch (err) {
      console.error('Error loading allowed types:', err);
      setAllowedTypes(['student']);
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
    allowedTypes,
    availableLevels,
    availableGrades,
    availableSections,
    availableShifts,
    getFiltersWithDates,
  };
}
