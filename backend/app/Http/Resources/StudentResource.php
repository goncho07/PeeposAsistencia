<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'student_code' => $this->student_code,
            'qr_code' => $this->qr_code,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'gender' => $this->gender,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'age' => $this->age,
            'academic_year' => $this->academic_year,
            'enrollment_status' => $this->enrollment_status,
            'photo_url' => $this->photo_url,
            'classroom' => $this->whenLoaded('classroom', function () {
                return [
                    'id' => $this->classroom->id,
                    'full_name' => $this->classroom->full_name,
                    'level' => $this->classroom->level,
                    'grade' => $this->classroom->grade,
                    'section' => $this->classroom->section,
                    'shift' => $this->classroom->shift,
                    'status' => $this->classroom->status,
                    'teacher' => $this->classroom->teacher ? [
                        'id' => $this->classroom->teacher->id,
                        'full_name' => $this->classroom->teacher->full_name,
                    ] : null,
                ];
            }),
            'parents' => $this->when($this->relationLoaded('parents'), function () {
                return $this->parents->map(function ($parent) {
                    return [
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
                    ];
                });
            }, [])
        ];
    }
}
