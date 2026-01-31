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
                return match ($this->attendable_type) {
                    'App\Models\Student' => new StudentResource($this->attendable),
                    'App\Models\Teacher' => new TeacherResource($this->attendable),
                    'App\Models\User' => new UserResource($this->attendable),
                    default => null,
                };
            }),
            'date' => $this->date?->format('Y-m-d'),
            'shift' => $this->shift,
            'entry_time' => $this->entry_time,
            'entry_status' => $this->entry_status,
            'entry_observation' => $this->entry_observation,
            'exit_time' => $this->exit_time,
            'exit_status' => $this->exit_status,
            'exit_observation' => $this->exit_observation,
            'recorded_by' => $this->recorded_by,
            'recorder' => $this->whenLoaded('recorder', function () {
                return [
                    'id' => $this->recorder->id,
                    'full_name' => $this->recorder->full_name,
                ];
            }),
            'device_type' => $this->device_type,
            'whatsapp_sent' => $this->whatsapp_sent,
            'whatsapp_sent_at' => $this->whatsapp_sent_at,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}