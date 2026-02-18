import apiClient from '../axios';
import { ApiResponse } from './types';

export type CalendarEventType =
    | 'FESTIVIDAD_NACIONAL'
    | 'FESTIVIDAD_REGIONAL'
    | 'FERIADO'
    | 'EVENTO_ESCOLAR'
    | 'ADMINISTRATIVO';

export interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    type: CalendarEventType;
    event_date: string;
    end_date: string | null;
    is_recurring: boolean;
    is_non_working_day: boolean;
    is_global: boolean;
    color: string | null;
}

export interface CreateCalendarEventData {
    title: string;
    description?: string | null;
    type: CalendarEventType;
    event_date: string;
    end_date?: string | null;
    is_recurring?: boolean;
    is_non_working_day?: boolean;
    color?: string | null;
    is_global?: boolean;
}

export interface UpdateCalendarEventData {
    title?: string;
    description?: string | null;
    type?: CalendarEventType;
    event_date?: string;
    end_date?: string | null;
    is_recurring?: boolean;
    is_non_working_day?: boolean;
    color?: string | null;
}

export const calendarService = {
    getEvents: async (year?: number): Promise<CalendarEvent[]> => {
        const params = new URLSearchParams();
        if (year) params.append('year', year.toString());

        const response = await apiClient.get<ApiResponse<CalendarEvent[]>>(`/calendar/events?${params.toString()}`);
        return response.data.data;
    },

    getEvent: async (id: number): Promise<CalendarEvent> => {
        const response = await apiClient.get<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`);
        return response.data.data;
    },

    createEvent: async (data: CreateCalendarEventData): Promise<CalendarEvent> => {
        const response = await apiClient.post<ApiResponse<CalendarEvent>>('/calendar/events', data);
        return response.data.data;
    },

    updateEvent: async (id: number, data: UpdateCalendarEventData): Promise<CalendarEvent> => {
        const response = await apiClient.put<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, data);
        return response.data.data;
    },

    deleteEvent: async (id: number): Promise<void> => {
        await apiClient.delete(`/calendar/events/${id}`);
    },

    getEventsByMonth: async (year: number, month: number): Promise<CalendarEvent[]> => {
        const events = await calendarService.getEvents(year);
        return events.filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate.getMonth() + 1 === month;
        });
    },

    getEventsForDate: async (date: string, year?: number): Promise<CalendarEvent[]> => {
        const events = await calendarService.getEvents(year);
        return events.filter(event => {
            if (event.end_date) {
                return date >= event.event_date && date <= event.end_date;
            }
            return event.event_date === date;
        });
    },

    isNonWorkingDay: async (date: string, year?: number): Promise<boolean> => {
        const events = await calendarService.getEventsForDate(date, year);
        return events.some(event => event.is_non_working_day);
    },
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
    FESTIVIDAD_NACIONAL: 'Festividad Nacional',
    FESTIVIDAD_REGIONAL: 'Festividad Regional',
    FERIADO: 'Feriado',
    EVENTO_ESCOLAR: 'Evento Escolar',
    ADMINISTRATIVO: 'Administrativo',
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    FESTIVIDAD_NACIONAL: '#ef4444',
    FESTIVIDAD_REGIONAL: '#f97316',
    FERIADO: '#22c55e',
    EVENTO_ESCOLAR: '#3b82f6',
    ADMINISTRATIVO: '#8b5cf6',
};
