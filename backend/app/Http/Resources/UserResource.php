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
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'dni' => $this->dni,
            'email' => $this->email,
            'role' => $this->role,
            'phone_number' => $this->phone_number,
            'photo_url' => get_storage_url($this->photo_url),
            'status' => $this->status,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->when($request->user()->id === $this->id || $request->user()->isSuperAdmin(), $this->last_login_ip),
        ];
    }
}
