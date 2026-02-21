<?php

namespace Database\Seeders;

use App\Models\CalendarEvent;
use Illuminate\Database\Seeder;

class CalendarEventSeeder extends Seeder
{
    /**
     * Seed global calendar events (Peruvian holidays and festivities).
     * These events have tenant_id = NULL and are visible to all tenants.
     */
    public function run(): void
    {
        $events = [
            [
                'title' => 'Año Nuevo',
                'description' => 'Celebración del inicio del nuevo año',
                'type' => 'FERIADO',
                'event_date' => '2025-01-01',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'Jueves Santo',
                'description' => 'Semana Santa - Jueves Santo',
                'type' => 'FERIADO',
                'event_date' => '2025-04-17',
                'is_recurring' => false,
                'is_non_working_day' => true,
                'color' => '#8B5CF6',
            ],
            [
                'title' => 'Viernes Santo',
                'description' => 'Semana Santa - Viernes Santo',
                'type' => 'FERIADO',
                'event_date' => '2025-04-18',
                'is_recurring' => false,
                'is_non_working_day' => true,
                'color' => '#8B5CF6',
            ],
            [
                'title' => 'Día del Trabajo',
                'description' => 'Día Internacional del Trabajo',
                'type' => 'FERIADO',
                'event_date' => '2025-05-01',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'San Pedro y San Pablo',
                'description' => 'Día de San Pedro y San Pablo',
                'type' => 'FERIADO',
                'event_date' => '2025-06-29',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'Día de la Independencia',
                'description' => 'Fiestas Patrias - Día de la Independencia del Perú',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-07-28',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#DC2626',
            ],
            [
                'title' => 'Fiestas Patrias',
                'description' => 'Fiestas Patrias - Segundo día',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-07-29',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#DC2626',
            ],
            [
                'title' => 'Batalla de Junín',
                'description' => 'Conmemoración de la Batalla de Junín',
                'type' => 'FERIADO',
                'event_date' => '2025-08-06',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'Santa Rosa de Lima',
                'description' => 'Día de Santa Rosa de Lima, patrona de América',
                'type' => 'FERIADO',
                'event_date' => '2025-08-30',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EC4899',
            ],
            [
                'title' => 'Combate de Angamos',
                'description' => 'Conmemoración del Combate de Angamos',
                'type' => 'FERIADO',
                'event_date' => '2025-10-08',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'Día de Todos los Santos',
                'description' => 'Día de Todos los Santos',
                'type' => 'FERIADO',
                'event_date' => '2025-11-01',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#8B5CF6',
            ],
            [
                'title' => 'Inmaculada Concepción',
                'description' => 'Día de la Inmaculada Concepción',
                'type' => 'FERIADO',
                'event_date' => '2025-12-08',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#3B82F6',
            ],
            [
                'title' => 'Batalla de Ayacucho',
                'description' => 'Conmemoración de la Batalla de Ayacucho',
                'type' => 'FERIADO',
                'event_date' => '2025-12-09',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#EF4444',
            ],
            [
                'title' => 'Navidad',
                'description' => 'Celebración de la Navidad',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-12-25',
                'is_recurring' => true,
                'is_non_working_day' => true,
                'color' => '#22C55E',
            ],

            [
                'title' => 'Día de la Educación',
                'description' => 'Día de la Educación en el Perú',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-04-01',
                'is_recurring' => true,
                'is_non_working_day' => false,
                'color' => '#3B82F6',
            ],
            [
                'title' => 'Día del Maestro',
                'description' => 'Día del Maestro Peruano',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-07-06',
                'is_recurring' => true,
                'is_non_working_day' => false,
                'color' => '#F59E0B',
            ],
            [
                'title' => 'Día del Estudiante',
                'description' => 'Día del Estudiante - Día de la Primavera',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-09-23',
                'is_recurring' => true,
                'is_non_working_day' => false,
                'color' => '#10B981',
            ],
            [
                'title' => 'Día de la Madre',
                'description' => 'Día de la Madre',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-05-11',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#EC4899',
            ],
            [
                'title' => 'Día del Padre',
                'description' => 'Día del Padre',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-06-15',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#3B82F6',
            ],
            [
                'title' => 'Día del Niño',
                'description' => 'Día del Niño Peruano',
                'type' => 'FESTIVIDAD_NACIONAL',
                'event_date' => '2025-08-17',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#F59E0B',
            ],

            [
                'title' => 'Inicio del Año Escolar',
                'description' => 'Inicio oficial del año escolar según MINEDU',
                'type' => 'ADMINISTRATIVO',
                'event_date' => '2025-03-10',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#06B6D4',
            ],
            [
                'title' => 'Fin del Año Escolar',
                'description' => 'Fin oficial del año escolar',
                'type' => 'ADMINISTRATIVO',
                'event_date' => '2025-12-19',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#06B6D4',
            ],
            [
                'title' => 'Vacaciones de Medio Año',
                'description' => 'Inicio de vacaciones de medio año',
                'type' => 'ADMINISTRATIVO',
                'event_date' => '2025-07-21',
                'end_date' => '2025-08-08',
                'is_recurring' => false,
                'is_non_working_day' => false,
                'color' => '#14B8A6',
            ],
        ];

        $count = 0;
        foreach ($events as $event) {
            CalendarEvent::updateOrCreate(array_merge($event, [
                'tenant_id' => null,
            ]));
            $count++;
        }

        $this->command->info('');
        $this->command->info('===================================');
        $this->command->info('Resumen de Eventos del Calendario:');
        $this->command->info('===================================');
        
        $this->command->table(
            ['Tipo', 'Cantidad'],
            CalendarEvent::whereNull('tenant_id')
                ->selectRaw('type, COUNT(*) as total')
                ->groupBy('type')
                ->orderBy('type')
                ->get()
                ->map(fn($e) => [$e->type, $e->total])
                ->toArray()
        );
        $this->command->info("Total: {$count} eventos globales creados.");
    }
}
