<?php

namespace App\Http\Resources;

use App\Traits\HasExpandableRelations;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
{
    use HasExpandableRelations;

    /**
     * Transform the resource into an array.
     *
     * Usage:
     * - GET /api/classrooms
     * - GET /api/classrooms?expand=tutor     
     * - GET /api/classrooms?expand=teachers
     * - GET /api/classrooms?expand=students
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
            'capacity' => $this->capacity,
            'tutor_id' => $this->tutor_id,
            'tutor' => $this->whenExpanded('tutor', fn () => $this->tutor ? [
                'id' => $this->tutor->id,
                'full_name' => $this->tutor->full_name,
                'document_number' => $this->tutor->document_number,
                'email' => $this->tutor->email,
                'phone_number' => $this->tutor->phone_number,
                'specialty' => $this->tutor->specialty,
            ] : null),

            'teachers' => $this->whenExpanded('teachers', fn () =>
                $this->teachers->map(fn ($teacher) => [
                    'id' => $teacher->id,
                    'full_name' => $teacher->full_name,
                    'specialty' => $teacher->specialty,
                    'subject' => $teacher->pivot->subject,
                    'academic_year' => $teacher->pivot->academic_year,
                ])
            ),

            'students' => $this->whenExpanded('students', fn () =>
                $this->students->map(fn ($student) => [
                    'id' => $student->id,
                    'student_code' => $student->student_code,
                    'full_name' => $student->full_name,
                    'document_number' => $student->document_number,
                    'enrollment_status' => $student->enrollment_status,
                ])
            ),

            'students_count' => $this->when(
                isset($this->students_count),
                $this->students_count
            ),
        ];
    }
}
