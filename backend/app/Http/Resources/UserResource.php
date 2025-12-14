<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'email' => $this->email,
            'dni' => $this->dni,
            'phone_number' => $this->phone_number,
            'rol' => $this->rol,
            'status' => $this->status,
            'avatar_url' => $this->avatar_url ?? null,
        ];
    }
}
