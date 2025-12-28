<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
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
            'dni' => $this->dni,
            'qr_code' => $this->qr_code,
            'photo_url' => $this->photo_url,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'gender' => $this->gender,
            'level' => $this->level,
            'area' => $this->area,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'status' => $this->status,
            'classrooms' => $this->whenLoaded('classrooms', function () {
                return $this->classrooms->map(function ($classroom) {
                    return [
                        'id' => $classroom->id,
                        'full_name' => $classroom->full_name,
                        'level' => $classroom->level,
                        'grade' => $classroom->grade,
                        'section' => $classroom->section,
                        'shift' => $classroom->shift,
                        'status' => $classroom->status,
                        'students_count' => $classroom->students_count ?? null,
                    ];
                });
            }),
        ];
    }
}
