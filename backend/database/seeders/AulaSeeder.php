<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Aula;

class AulaSeeder extends Seeder
{
    public function run(): void
    {
        $aulas = [
            'INICIAL' => [
                3 => ['MARGARITAS', 'CRISANTEMOS'],
                4 => ['JASMINEZ', 'ROSAS', 'LIRIOS', 'GERANIOS'],
                5 => ['ORQUIDEAS', 'TULIPANES', 'GIRASOLES', 'CLAVELES'],
            ],
            'PRIMARIA' => [
                1 => ['A', 'B', 'C'],
                2 => ['A', 'B', 'C'],
                3 => ['A', 'B', 'C'],
                4 => ['A', 'B', 'C', 'D'],
                5 => ['A', 'B', 'C'],
                6 => ['A', 'B', 'C'],
            ],
            'SECUNDARIA' => [
                1 => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
                2 => ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
                3 => ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
                4 => ['A', 'B', 'C', 'D', 'E', 'F'],
                5 => ['A', 'B', 'C', 'D', 'E', 'F'],
            ],
        ];

        foreach ($aulas as $nivel => $grados) {
            foreach ($grados as $grado => $secciones) {
                foreach ($secciones as $seccion) {
                    Aula::firstOrCreate([
                        'nivel' => $nivel,
                        'grado' => $grado,
                        'seccion' => $seccion,
                    ]);
                }
            }
        }

        $total = Aula::count();
        $this->command->info("Se crearon {$total} aulas (o ya existían).");
    }
}
