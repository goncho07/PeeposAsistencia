<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ParentResource extends JsonResource
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
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'photo_url' => get_storage_url($this->photo_url),
            'students' => $this->when($this->relationLoaded('students'), function () {
                return $this->students->map(function ($student) {
                    return [
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
                    ];
                });
            }, []),
        ];
    }
}
