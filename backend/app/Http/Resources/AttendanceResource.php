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
                if ($this->attendable_type === 'App\Models\Student') {
                    return new StudentResource($this->attendable);
                } elseif ($this->attendable_type === 'App\Models\Teacher') {
                    return new TeacherResource($this->attendable);
                }
                return null;
            }),
            'date' => $this->date?->format('Y-m-d'),
            'shift' => $this->shift,
            'entry_time' => $this->entry_time?->format('H:i:s'),
            'exit_time' => $this->exit_time?->format('H:i:s'),
            'entry_status' => $this->entry_status,
            'exit_status' => $this->exit_status,
            'entry_observation' => $this->entry_observation,
            'exit_observation' => $this->exit_observation,
            'whatsapp_sent' => $this->whatsapp_sent,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}