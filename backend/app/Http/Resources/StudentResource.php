<?php

namespace App\Http\Resources;

use App\Traits\HasExpandableRelations;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    use HasExpandableRelations;

    /**
     * Transform the resource into an array.
     *
     * Usage:
     * - GET /api/students       
     * - GET /api/students?expand=classroom
     * - GET /api/students?expand=classroom,parents
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'qr_code' => $this->qr_code,

            'student_code' => $this->student_code,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'gender' => $this->gender,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'birth_place' => $this->birth_place,
            'nationality' => $this->nationality,
            'age' => $this->age,
            'photo_url' => get_storage_url($this->photo_url),

            'academic_year' => $this->academic_year,
            'enrollment_status' => $this->enrollment_status,

            'classroom_id' => $this->classroom_id,
            'classroom' => $this->whenExpanded('classroom', fn () => [
                'id' => $this->classroom->id,
                'full_name' => $this->classroom->full_name,
                'level' => $this->classroom->level,
                'grade' => $this->classroom->grade,
                'section' => $this->classroom->section,
                'shift' => $this->classroom->shift,
                'tutor' => $this->classroom->tutor ? [
                    'id' => $this->classroom->tutor->id,
                    'full_name' => $this->classroom->tutor->full_name,
                ] : null,
            ]),

            'parents' => $this->whenExpanded('parents', fn () => $this->parents->map(fn ($parent) => [
                'id' => $parent->id,
                'full_name' => $parent->full_name,
                'document_type' => $parent->document_type,
                'document_number' => $parent->document_number,
                'phone_number' => $parent->phone_number,
                'email' => $parent->email,
                'relationship' => [
                    'type' => $parent->pivot->relationship_type,
                    'custom_label' => $parent->pivot->custom_relationship_label,
                    'is_primary_contact' => $parent->pivot->is_primary_contact,
                    'receives_notifications' => $parent->pivot->receives_notifications,
                ],
            ])),
        ];
    }
}
