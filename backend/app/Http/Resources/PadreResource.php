<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PadreResource extends JsonResource
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
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'relationship_type' => $this->relationship_type,
            'children' => $this->whenLoaded('estudiantes', function () {
                return $this->estudiantes->map(fn($hijo) => [
                    'id' => $hijo->id,
                    'full_name' => $hijo->full_name,
                    'student_code' => $hijo->student_code,
                    'aula' => $hijo->aula ? [
                        'id' => $hijo->aula->id,
                        'full_name' => $hijo->aula->nombre_completo,
                    ] : null,
                ]);
            }),
        ];
    }
}
