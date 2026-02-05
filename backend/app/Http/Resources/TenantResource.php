<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
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
            'code' => $this->code ?? $this->modular_code,
            'modular_code' => $this->modular_code,
            'name' => $this->name,
            'slug' => $this->slug,
            'ruc' => $this->ruc,
            'director_name' => $this->director_name,
            'founded_year' => $this->founded_year,
            'institution_type' => $this->institution_type,
            'level' => $this->level,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'district' => $this->district,
            'province' => $this->province,
            'department' => $this->department,
            'ugel' => $this->ugel,
            'ubigeo' => $this->ubigeo,
            'timezone' => $this->timezone,
            'is_active' => $this->is_active,
            'logo_url' => get_storage_url($this->logo_url),
            'banner_url' => get_storage_url($this->banner_url),
            'background_url' => get_storage_url($this->background_url),
            'primary_color' => $this->primary_color,
            'last_activity_at' => $this->last_activity_at,
            'created_at' => $this->created_at,
            'counts' => [
                'users' => $this->users_count ?? 0,
                'students' => $this->students_count ?? 0,
                'teachers' => $this->teachers_count ?? 0,
                'classrooms' => $this->classrooms_count ?? 0,
            ],
        ];
    }
}
