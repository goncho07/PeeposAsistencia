<?php

namespace App\Services;

use App\Models\CalendarEvent;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;

class CalendarEventService
{
    use LogsActivity;

    public function __construct(
        protected AcademicYearService $academicYearService
    ) {}

    /**
     * Get all events for a year.
     * Includes global events and tenant-specific events.
     *
     * @param int|null $year Defaults to current academic year
     * @param int|null $tenantId
     */
    public function getAllEvents(?int $year = null, ?int $tenantId = null): Collection
    {
        $year = $year ?? $this->academicYearService->getCurrentYearNumber($tenantId);
        $startDate = "{$year}-01-01";
        $endDate = "{$year}-12-31";

        return CalendarEvent::query()
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where(function ($q) use ($startDate, $endDate) {
                    $q->where('is_recurring', false)
                      ->whereBetween('event_date', [$startDate, $endDate]);
                })
                ->orWhere('is_recurring', true);
            })
            ->when($tenantId, fn($q) => $q->forTenant($tenantId), fn($q) => $q->global())
            ->orderBy('event_date')
            ->get();
    }

    /**
     * Get event by ID.
     */
    public function findById(int $id): CalendarEvent
    {
        return CalendarEvent::findOrFail($id);
    }

    /**
     * Create a new calendar event.
     */
    public function create(array $data): CalendarEvent
    {
        $data['academic_year_id'] = $data['academic_year_id']
            ?? $this->academicYearService->getCurrentYear()?->id;

        $event = CalendarEvent::create($data);

        $this->logActivity('calendar_event_created', $event, [
            'title' => $event->title,
            'type' => $event->type,
        ]);

        return $event;
    }

    /**
     * Update an existing calendar event.
     */
    public function update(int $id, array $data): CalendarEvent
    {
        $event = CalendarEvent::findOrFail($id);

        $oldValues = $event->only(['title', 'type', 'event_date']);
        $event->update($data);
        $newValues = $event->only(array_keys($oldValues));

        $this->logActivityWithChanges('calendar_event_updated', $event, $oldValues, $newValues);

        return $event;
    }

    /**
     * Delete a calendar event.
     */
    public function delete(int $id): void
    {
        $event = CalendarEvent::findOrFail($id);

        $this->logActivity('calendar_event_deleted', $event, [
            'title' => $event->title,
        ]);

        $event->delete();
    }
}
