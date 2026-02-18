import { useState, useEffect, useMemo } from 'react';
import { calendarService, CalendarEvent } from '@/lib/api/calendar';

const DAYS_OF_WEEK = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export { DAYS_OF_WEEK, MONTHS };

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export function useCalendarEvents(enabled: boolean = true) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (!enabled) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await calendarService.getEvents(year);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [year, enabled]);

  const formatDateToString = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDateToString(date);
    return events.filter(event => {
      if (event.end_date) {
        return dateStr >= event.event_date && dateStr <= event.end_date;
      }
      return event.event_date === dateStr;
    });
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isToday: false, events: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        events: getEventsForDate(date),
      });
    }

    const totalDays = 42; // Always 6 rows for consistent height
    for (let i = days.length; i < totalDays; i++) {
      const date = new Date(year, month + 1, i - days.length + 1);
      days.push({ date, isCurrentMonth: false, isToday: false, events: [] });
    }

    return days;
  }, [year, month, events]);

  const eventsForCurrentMonth = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return events
      .filter(event => {
        const eventDate = new Date(event.event_date + 'T00:00:00');
        const eventEndDate = event.end_date ? new Date(event.end_date + 'T00:00:00') : eventDate;
        return eventDate <= monthEnd && eventEndDate >= monthStart;
      })
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events, year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    if (day.events.length > 0) {
      setSelectedDay(selectedDay?.date.getTime() === day.date.getTime() ? null : day);
    } else {
      setSelectedDay(null);
    }
  };

  return {
    currentDate,
    year,
    month,
    calendarDays,
    eventsForCurrentMonth,
    selectedDay,
    loading,
    goToPreviousMonth,
    goToNextMonth,
    handleDayClick,
    setSelectedDay,
  };
}
