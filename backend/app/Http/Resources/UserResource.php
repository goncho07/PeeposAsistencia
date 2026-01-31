<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,

            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'photo_url' => get_storage_url($this->photo_url),

            'email' => $this->email,
            'role' => $this->role,
            'phone_number' => $this->phone_number,
            
            'status' => $this->status,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->when(
                $request->user() && ($request->user()->id === $this->id || $request->user()->isSuperAdmin()),
                $this->last_login_ip
            ),

            'teacher' => $this->whenLoaded('teacher', function () {
                return [
                    'id' => $this->teacher->id,
                    'level' => $this->teacher->level,
                    'specialty' => $this->teacher->specialty,
                ];
            }),
        ];
    }
}
