<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'classroom_id' => $this->classroom_id,
            'classroom' => $this->whenLoaded('classroom', fn() => [
                'id' => $this->classroom->id,
                'full_name' => $this->classroom->full_name,
                'level' => $this->classroom->level,
                'grade' => $this->classroom->grade,
                'section' => $this->classroom->section,
                'shift' => $this->classroom->shift,
            ]),
            'student_id' => $this->student_id,
            'student' => $this->whenLoaded('student', fn() => new StudentResource($this->student)),
            'reported_by' => $this->reported_by,
            'reporter' => $this->whenLoaded('reporter', fn() => new AdminUserResource($this->reporter)),
            'date' => $this->date?->format('Y-m-d'),
            'time' => $this->time?->format('H:i'),
            'type' => $this->type,
            'type_label' => $this->type_label,
            'severity' => $this->severity,
            'severity_label' => $this->severity_label,
            'description' => $this->description,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'resolution_notes' => $this->resolution_notes,
            'resolved_by' => $this->resolved_by,
            'resolver' => $this->whenLoaded('resolver', fn() => $this->resolver ? new AdminUserResource($this->resolver) : null),
            'resolved_at' => $this->resolved_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
