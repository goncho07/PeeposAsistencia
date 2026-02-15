<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
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
            'attendable_type' => $this->attendable_type,
            'attendable_id' => $this->attendable_id,
            'attendable' => $this->whenLoaded('attendable', function () {
                $attendable = $this->attendable;
                $base = [
                    'id' => $attendable->id,
                    'full_name' => $attendable->full_name,
                ];

                if ($this->attendable_type === 'App\Models\Student') {
                    $base['student_code'] = $attendable->student_code;
                    $base['photo_url'] = get_storage_url($attendable->photo_url);
                    $base['classroom'] = $attendable->relationLoaded('classroom') && $attendable->classroom ? [
                        'id' => $attendable->classroom->id,
                        'full_name' => $attendable->classroom->full_name,
                        'level' => $attendable->classroom->level,
                        'grade' => $attendable->classroom->grade,
                        'section' => $attendable->classroom->section,
                        'shift' => $attendable->classroom->shift,
                    ] : null;
                } elseif ($this->attendable_type === 'App\Models\Teacher') {
                    $base['photo_url'] = get_storage_url($attendable->photo_url ?? $attendable->user?->photo_url);
                }

                return $base;
            }),
            'date' => $this->date?->format('Y-m-d'),
            'shift' => $this->shift,
            'entry_time' => $this->entry_time,
            'entry_status' => $this->entry_status,
            'exit_time' => $this->exit_time,
            'exit_status' => $this->exit_status,
            'device_type' => $this->device_type,
            'whatsapp_sent' => $this->whatsapp_sent,
            'whatsapp_sent_at' => $this->whatsapp_sent_at,
        ];
    }
}