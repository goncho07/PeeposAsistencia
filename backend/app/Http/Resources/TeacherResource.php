<?php

namespace App\Http\Resources;

use App\Traits\HasExpandableRelations;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    use HasExpandableRelations;

    /**
     * Transform the resource into an array.
     *
     * Personal data comes from the user relation (via accessors).
     *
     * Usage:
     * - GET /api/teachers                              → Solo datos básicos
     * - GET /api/teachers?expand=user                  → Con detalles de cuenta
     * - GET /api/teachers?expand=classrooms            → Con aulas que enseña
     * - GET /api/teachers?expand=tutoredClassrooms     → Con aulas que tutora
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'qr_code' => $this->qr_code,

            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'photo_url' => get_storage_url($this->photo_url),

            'level' => $this->level,
            'specialty' => $this->specialty,
            'contract_type' => $this->contract_type,
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'status' => $this->status,

            'user' => $this->whenExpanded('user', fn () => [
                'id' => $this->user->id,
                'email' => $this->user->email,
                'role' => $this->user->role,
                'status' => $this->user->status,
                'last_login_at' => $this->user->last_login_at?->toIso8601String(),
            ]),

            'tutored_classrooms' => $this->whenExpanded('tutoredClassrooms', fn () =>
                $this->tutoredClassrooms->map(fn ($classroom) => [
                    'id' => $classroom->id,
                    'full_name' => $classroom->full_name,
                    'level' => $classroom->level,
                    'grade' => $classroom->grade,
                    'section' => $classroom->section,
                    'shift' => $classroom->shift,
                ])
            ),

            'classrooms' => $this->whenExpanded('classrooms', fn () =>
                $this->classrooms->map(fn ($classroom) => [
                    'id' => $classroom->id,
                    'full_name' => $classroom->full_name,
                    'level' => $classroom->level,
                    'grade' => $classroom->grade,
                    'section' => $classroom->section,
                    'shift' => $classroom->shift,
                    'subject' => $classroom->pivot->subject,
                    'academic_year' => $classroom->pivot->academic_year,
                ])
            ),
        ];
    }
}
