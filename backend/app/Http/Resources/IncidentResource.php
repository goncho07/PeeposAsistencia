<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
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
            'reporter' => $this->whenLoaded('reporter', fn() => [
                'id' => $this->reporter->id,
                'full_name' => $this->reporter->full_name,
            ]),
            'date' => $this->date?->format('Y-m-d'),
            'time' => $this->time?->format('H:i'),
            'type' => $this->type,
            'type_label' => $this->type_label,
            'severity' => $this->severity,
            'severity_label' => $this->severity_label,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
