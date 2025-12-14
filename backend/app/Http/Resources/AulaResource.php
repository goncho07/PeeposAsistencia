<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AulaResource extends JsonResource
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
            'code' => $this->codigo,
            'full_name' => $this->nombre_completo,
            'level' => $this->nivel,
            'grade' => $this->grado,
            'section' => $this->seccion,
            'docente' => $this->whenLoaded('docente', function () {
                return [
                    'id' => $this->docente->id,
                    'full_name' => $this->docente->full_name,
                ];
            }),
            'student_count' => $this->estudiantes_count,
        ];
    }
}
