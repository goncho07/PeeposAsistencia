<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Bimester;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No hay tenants. Ejecuta TenantSeeder primero.');
            return;
        }

        $bimesters = [
            ['number' => 1, 'start_date' => '2025-03-03', 'end_date' => '2025-05-09'],
            ['number' => 2, 'start_date' => '2025-05-19', 'end_date' => '2025-07-25'],
            ['number' => 3, 'start_date' => '2025-08-11', 'end_date' => '2025-10-10'],
            ['number' => 4, 'start_date' => '2025-10-20', 'end_date' => '2025-12-19'],
        ];

        foreach ($tenants as $tenant) {
            $academicYear = AcademicYear::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'year' => 2025,
                ],
                [
                    'start_date' => '2025-03-03',
                    'end_date' => '2025-12-19',
                    'status' => 'ACTIVO',
                    'is_current' => true,
                ]
            );

            foreach ($bimesters as $bimesterData) {
                Bimester::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'academic_year_id' => $academicYear->id,
                        'number' => $bimesterData['number'],
                    ],
                    [
                        'start_date' => $bimesterData['start_date'],
                        'end_date' => $bimesterData['end_date'],
                    ]
                );
            }

            $tenant->update(['current_academic_year_id' => $academicYear->id]);

            $this->command->info("Año académico 2025 creado para: {$tenant->name}");
        }

        $this->command->info('');
        $this->command->info('=============================');
        $this->command->info('Resumen de Años Académicos:');
        $this->command->info('=============================');
        $this->command->table(
            ['Tenant', 'Año', 'Estado', 'Bimestres'],
            AcademicYear::with('tenant', 'bimesters')->get()->map(fn($ay) => [
                $ay->tenant->name,
                $ay->year,
                $ay->status,
                $ay->bimesters->count(),
            ])->toArray()
        );
    }
}
