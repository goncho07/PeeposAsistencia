<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EstudianteResource extends JsonResource
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
            'student_code' => $this->student_code,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
            'age' => $this->edad,
            'qr_code' => $this->qr_code,
            'aula' => $this->whenLoaded('aula', function () {
                return [
                    'id' => $this->aula->id,
                    'code' => $this->aula->codigo,
                    'full_name' => $this->aula->nombre_completo,
                    'level' => $this->aula->nivel,
                    'grade' => $this->aula->grado,
                    'section' => $this->aula->seccion,
                    'docente' => $this->aula->docente
                        ? [
                            'id' => $this->aula->docente->id,
                            'full_name' => $this->aula->docente->full_name,
                        ]
                        : null,
                    'student_count' => $this->aula->estudiantes_count ?? 0
                ];
            }),
            'padre' => $this->whenLoaded('padre', function () {
                return [
                    'id' => $this->padre->id,
                    'full_name' => $this->padre->full_name,
                    'phone_number' => $this->padre->phone_number,
                ];
            }),
        ];
    }
}
