<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CalendarEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $year = $request->query('year', now()->year);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'event_date' => $this->is_recurring
                ? $this->getEventDateForYear((int) $year)
                : $this->event_date->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'is_recurring' => $this->is_recurring,
            'is_non_working_day' => $this->is_non_working_day,
            'is_global' => $this->tenant_id === null,
            'color' => $this->color,
        ];
    }
}
