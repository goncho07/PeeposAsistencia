<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
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
            'level' => $this->level,
            'grade' => $this->grade,
            'grade_name' => $this->getGradeName(),
            'section' => $this->section,
            'shift' => $this->shift,
            'status' => $this->status,
            'teacher' => $this->whenLoaded('teacher', function () {
                return $this->teacher ? [
                    'id' => $this->teacher->id,
                    'full_name' => $this->teacher->full_name,
                    'dni' => $this->teacher->dni,
                    'email' => $this->teacher->email,
                    'phone_number' => $this->teacher->phone_number,
                    'level' => $this->teacher->level,
                    'area' => $this->teacher->area,
                ] : null;
            }),
            'students' => $this->whenLoaded('students', function () {
                return $this->students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'student_code' => $student->student_code,
                        'full_name' => $student->full_name,
                        'document_number' => $student->document_number,
                        'enrollment_status' => $student->enrollment_status,
                    ];
                });
            }),
            'students_count' => $this->when(
                isset($this->students_count),
                $this->students_count
            ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
