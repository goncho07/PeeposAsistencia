<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JustificationResource extends JsonResource
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
            'justifiable_type' => $this->justifiable_type,
            'justifiable_id' => $this->justifiable_id,
            'justifiable' => $this->whenLoaded('justifiable', function () {
                if ($this->justifiable_type === 'App\Models\Student') {
                    return new StudentResource($this->justifiable);
                } elseif ($this->justifiable_type === 'App\Models\Teacher') {
                    return new TeacherResource($this->justifiable);
                }
                return null;
            }),
            'date_from' => $this->date_from?->format('Y-m-d'),
            'date_to' => $this->date_to?->format('Y-m-d'),
            'type' => $this->type,
            'reason' => $this->reason,
            'document_path' => $this->document_path,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn() => new AdminUserResource($this->creator)),
            'days_count' => $this->getDaysCount(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}