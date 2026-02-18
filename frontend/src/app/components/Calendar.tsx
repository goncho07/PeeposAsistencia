'use client';
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/app/components/ui/base';
import {
  useCalendarEvents,
  DAYS_OF_WEEK,
  MONTHS,
} from '@/app/features/dashboard/hooks/useCalendarEvents';
import { CalendarEvent, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, CalendarEventType } from '@/lib/api/calendar';

function formatEventDate(dateStr: string, endDateStr?: string | null) {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const start = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', opts);
  if (endDateStr && endDateStr !== dateStr) {
    const end = new Date(endDateStr + 'T00:00:00').toLocaleDateString('es-PE', opts);
    return `${start} - ${end}`;
  }
  return start;
}

export function Calendar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
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
  } = useCalendarEvents(isOpen);

  const handleEventClick = (event: CalendarEvent) => {
    const eventDate = new Date(event.event_date + 'T00:00:00');
    const day = calendarDays.find(
      (d) => d.isCurrentMonth && d.date.getTime() === eventDate.getTime()
    );
    if (day) {
      const alreadySelected = selectedDay?.date.getTime() === day.date.getTime();
      setSelectedDay(alreadySelected ? null : day);
    }
  };

  const isEventSelected = (event: CalendarEvent) => {
    if (!selectedDay) return false;
    const eventDate = new Date(event.event_date + 'T00:00:00');
    return selectedDay.date.getTime() === eventDate.getTime();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-colors hover:bg-surface-hover text-text-primary cursor-pointer"
        aria-label="Abrir calendario"
      >
        <CalendarDays className="w-7 h-7 text-text-secondary" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Calendario Escolar" size="full">
        {loading ? (
          <div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6 bg-background rounded-xl py-4 px-2">
                  <div className="p-2"><div className="w-6 h-6 bg-card animate-pulse rounded" /></div>
                  <div className="h-7 w-40 bg-card animate-pulse rounded-lg" />
                  <div className="p-2"><div className="w-6 h-6 bg-card animate-pulse rounded" /></div>
                </div>

                <div className="grid grid-cols-7 text-center mb-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="py-2 flex justify-center">
                      <div className="h-4 w-6 bg-card animate-pulse rounded" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div key={i} className="py-3 flex flex-col items-center justify-center">
                      <div className="h-6 w-6 bg-card animate-pulse rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-80 lg:w-96 shrink-0">
                <div className="h-6 w-36 bg-card animate-pulse rounded-lg mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background">
                      <div className="w-3 h-3 rounded-full bg-card animate-pulse shrink-0 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 bg-card animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-card animate-pulse rounded" />
                        <div className="h-5 w-20 bg-card animate-pulse rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-card animate-pulse" />
                  <div className="h-4 w-16 bg-card animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-6 bg-background rounded-xl py-4 px-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg"
                  >
                    <ChevronLeft className="w-6 h-6 text-text-secondary cursor-pointer" />
                  </button>

                  <h4 className="text-2xl font-bold text-text-primary select-none">
                    {MONTHS[month]} {year}
                  </h4>

                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg"
                  >
                    <ChevronRight className="w-6 h-6 text-text-secondary cursor-pointer" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center mb-3">
                  {DAYS_OF_WEEK.map((day, i) => (
                    <div
                      key={i}
                      className="text-base font-bold text-text-secondary py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const hasEvents = day.events.length > 0;
                    const isSelected = selectedDay?.date.getTime() === day.date.getTime();
                    const selectedColor = isSelected && hasEvents
                      ? (day.events[0].color || EVENT_TYPE_COLORS[day.events[0].type])
                      : undefined;
                    return (
                      <button
                        key={i}
                        onClick={() => handleDayClick(day)}
                        className={`relative py-3 rounded-lg flex flex-col items-center justify-center transition-all
                          ${day.isCurrentMonth
                            ? 'text-xl font-semibold text-text-primary'
                            : 'invisible'}
                          ${day.isToday ? 'bg-primary text-white font-bold' : ''}
                          ${hasEvents && day.isCurrentMonth ? 'hover:bg-primary/10 cursor-pointer' : ''}
                        `}
                        style={selectedColor ? { boxShadow: `0 0 0 2px ${selectedColor}`, borderRadius: '0.5rem' } : undefined}
                      >
                        <span>{day.date.getDate()}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5 mt-0.5">
                            {day.events.slice(0, 3).map((event, j) => (
                              <span
                                key={j}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.type] }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:w-80 lg:w-96 shrink-0">
                <h4 className="text-xl font-bold text-text-primary mb-4">
                  Eventos del Mes
                </h4>

                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                  {eventsForCurrentMonth.map((event) => {
                    const isSelected = isEventSelected(event);
                    const eventColor = event.color || EVENT_TYPE_COLORS[event.type];

                    return (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer
                          ${isSelected
                            ? 'border-2'
                            : 'border-border bg-background hover:bg-surface-hover'}
                        `}
                        style={{
                          borderColor: isSelected ? eventColor : undefined,
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: eventColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-lg text-text-primary truncate">
                            {event.title}
                          </p>
                          <p className="text-base text-text-secondary">
                            {formatEventDate(event.event_date, event.end_date)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-text-secondary px-2 py-0.5 rounded-full bg-card">
                              {EVENT_TYPE_LABELS[event.type]}
                            </span>
                            {event.is_non_working_day && (
                              <span className="text-sm font-medium text-danger px-2 py-0.5 rounded-full bg-danger/10">
                                No laborable
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4">
              {(Object.keys(EVENT_TYPE_LABELS) as CalendarEventType[]).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[type] }}
                  />
                  <span className="text-sm text-text-secondary">{EVENT_TYPE_LABELS[type]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
