<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Classroom;
use App\Models\Tenant;

class ClassroomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No hay tenants. Ejecuta TenantSeeder primero.');
            return;
        }

        $tenant1 = $tenants->firstWhere('modular_code', '0325464');

        if ($tenant1) {
            $classroomsTenant1 = [
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

            $this->createClassroomsWithShift($tenant1, $classroomsTenant1, 'MAÑANA');
            $this->command->info(" Aulas creadas para: {$tenant1->name} (Todas turno MAÑANA)");
        }

        $tenant2 = $tenants->firstWhere('modular_code', '0325265');

        $tenant2 = $tenants->firstWhere('modular_code', '0325265');

        if ($tenant2) {
            $this->createClassroomsWithShift($tenant2, [
                'INICIAL' => [
                    3 => ['ANARANJADO', 'TURQUESA'],
                    4 => ['LILA', 'CELESTE', 'VERDE'],
                    5 => ['MORADO', 'ROJO', 'AMARILLO'],
                ],
            ], 'MAÑANA');

            $this->createClassroomsWithShift($tenant2, [
                'INICIAL' => [
                    3 => ['ANARANJADO', 'TURQUESA'],
                    4 => ['LILA', 'CELESTE', 'VERDE'],
                    5 => ['MORADO', 'ROJO', 'AMARILLO'],
                ],
            ], 'TARDE');

            foreach ([1, 2, 3, 4, 5, 6] as $grade) {
                $this->createClassroomsWithShift($tenant2, [
                    'PRIMARIA' => [
                        $grade => ['A', 'B', 'C'],
                    ],
                ], 'MAÑANA');
            }

            $this->createClassroomsWithShift($tenant2, [
                'PRIMARIA' => [
                    1 => ['D', 'E', 'F'],
                    2 => ['D', 'E', 'F'],
                    3 => ['D', 'E', 'F'],
                    4 => ['D', 'E'],
                    5 => ['D', 'E', 'F'],
                    6 => ['D', 'E', 'F'],
                ],
            ], 'TARDE');

            $this->createClassroomsWithShift($tenant2, [
                'SECUNDARIA' => [
                    1 => ['A', 'B', 'C', 'D'],
                    2 => ['A', 'B', 'C', 'D'],
                    3 => ['A', 'B', 'C', 'D'],
                    4 => ['A', 'B', 'C'],
                    5 => ['A', 'B', 'C'],
                ],
            ], 'MAÑANA');

            $this->createClassroomsWithShift($tenant2, [
                'SECUNDARIA' => [
                    1 => ['E', 'F', 'G'],
                    2 => ['E', 'F', 'G'],
                    3 => ['E', 'F', 'G'],
                    4 => ['D', 'E', 'F', 'G'],
                    5 => ['D', 'E', 'F', 'G'],
                ],
            ], 'TARDE');

            $this->command->info(" Aulas creadas para: {$tenant2->name} (Con turnos MAÑANA y TARDE)");
        }

        $this->command->info('');
        $this->command->info('============================');
        $this->command->info('Resumen de Aulas Creadas:');
        $this->command->info('============================');

        $allClassrooms = Classroom::with('tenant')->get();

        $this->command->table(
            ['ID', 'Tenant', 'Nivel', 'Grado', 'Sección', 'Estado'],
            $allClassrooms->map(fn($c) => [
                $c->id,
                $c->tenant?->name ?? 'N/A',
                $c->level,
                $c->grade,
                $c->section,
                $c->status,
            ])->toArray()
        );
    }

    private function createClassroomsWithShift($tenant, $classrooms, $shift): void
    {
        foreach ($classrooms as $level => $grades) {
            foreach ($grades as $grade => $sections) {
                foreach ($sections as $section) {
                    Classroom::firstOrCreate([
                        'tenant_id' => $tenant->id,
                        'level' => $level,
                        'grade' => $grade,
                        'section' => $section,
                    ], [
                        'tutor_id' => null,
                        'shift' => $shift,
                        'status' => 'ACTIVO',
                    ]);
                }
            }
        }
    }
}
