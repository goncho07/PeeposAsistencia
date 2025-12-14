<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocenteResource extends JsonResource
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
            'dni' => $this->dni,
            'full_name' => $this->full_name,
            'name' => $this->name,
            'paternal_surname' => $this->paternal_surname,
            'maternal_surname' => $this->maternal_surname,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'area' => $this->area,
            'level' => $this->nivel,
            'aulas_tutorizadas' => $this->whenLoaded('aulas', function () {
                return $this->aulas->map(fn($aula) => [
                    'id' => $aula->id,
                    'code' => $aula->codigo,
                    'full_name' => $aula->nombre_completo,
                ]);
            }),
        ];
    }
}
