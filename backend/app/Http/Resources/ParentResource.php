<?php

namespace App\Http\Resources;

use App\Traits\ExpandableResource;
use Illuminate\Http\Resources\Json\JsonResource;

class ParentResource extends JsonResource
{
    use ExpandableResource;

    /**
     * Transform the resource into an array.
     *
     * Usage:
     * - GET /api/parents
     * - GET /api/parents?expand=students
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

            'phone_number' => $this->phone_number,
            'phone_number_secondary' => $this->phone_number_secondary,

            'email' => $this->email,
            'address' => $this->address,
            'workplace' => $this->workplace,

            'students' => $this->whenExpanded('students', fn () =>
                $this->students->map(fn ($student) => [
                    'id' => $student->id,
                    'student_code' => $student->student_code,
                    'full_name' => $student->full_name,
                    'document_number' => $student->document_number,
                    'enrollment_status' => $student->enrollment_status,
                    'classroom' => $student->classroom ? [
                        'id' => $student->classroom->id,
                        'full_name' => $student->classroom->full_name,
                    ] : null,
                    'relationship' => [
                        'type' => $student->pivot->relationship_type,
                        'custom_label' => $student->pivot->custom_relationship_label,
                        'is_primary_contact' => $student->pivot->is_primary_contact,
                        'receives_notifications' => $student->pivot->receives_notifications,
                    ],
                ])
            ),

            'students_count' => $this->when(
                isset($this->students_count),
                $this->students_count
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
