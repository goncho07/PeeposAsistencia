<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
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

        foreach ($tenants as $tenant) {
            $this->createSettingsForTenant($tenant);
        }

        $this->displaySummary();
    }

    private function createSettingsForTenant(Tenant $tenant): void
    {
        $this->command->info("Creando configuraciones para: {$tenant->name}");

        $baseSettings = $this->getBaseSettings();

        $scheduleSettings = $this->getScheduleSettings($tenant);

        $allSettings = array_merge($baseSettings, $scheduleSettings);

        $createdCount = 0;

        foreach ($allSettings as $settingData) {
            $settingData['tenant_id'] = $tenant->id;

            Setting::updateOrCreate($settingData);
            $createdCount++;
        }

        $this->command->info(" {$createdCount} configuraciones creadas para: {$tenant->name}");
    }

    private function getBaseSettings(): array
    {
        return [
            [
                'key' => 'whatsapp_inicial_phone',
                'value' => '',
                'type' => 'string',
                'group' => 'whatsapp',
                'description' => 'Número de WhatsApp para notificaciones de nivel inicial',
            ],
            [
                'key' => 'whatsapp_primaria_phone',
                'value' => '',
                'type' => 'string',
                'group' => 'whatsapp',
                'description' => 'Número de WhatsApp para notificaciones de nivel primaria',
            ],
            [
                'key' => 'whatsapp_secundaria_phone',
                'value' => '',
                'type' => 'string',
                'group' => 'whatsapp',
                'description' => 'Número de WhatsApp para notificaciones de nivel secundaria',
            ],
            [
                'key' => 'whatsapp_notifications_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'whatsapp',
                'description' => 'Activar/desactivar notificaciones por WhatsApp',
            ],
            [
                'key' => 'whatsapp_send_on_entry',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'whatsapp',
                'description' => 'Enviar notificación al registrar entrada',
            ],
            [
                'key' => 'whatsapp_send_on_exit',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'whatsapp',
                'description' => 'Enviar notificación al registrar salida',
            ],
            [
                'key' => 'whatsapp_send_on_absence',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'whatsapp',
                'description' => 'Enviar notificación por inasistencia',
            ],

            [
                'key' => 'attendance_days',
                'value' => json_encode(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']),
                'type' => 'json',
                'group' => 'general',
                'description' => 'Días de asistencia habilitados',
            ],
            [
                'key' => 'tardiness_tolerance_minutes',
                'value' => '5',
                'type' => 'integer',
                'group' => 'general',
                'description' => 'Minutos de tolerancia antes de marcar tardanza',
            ],
            [
                'key' => 'timezone',
                'value' => 'America/Lima',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Zona horaria de la institución',
            ],
            [
                'key' => 'auto_mark_absences',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Marcar automáticamente como falta si no hay registro',
            ],
            [
                'key' => 'auto_mark_absences_time',
                'value' => '10:00',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Hora límite para marcar faltas automáticamente',
            ],

            [
                'key' => 'bimestre_1_inicio',
                'value' => '2025-03-03',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de inicio del primer bimestre',
            ],
            [
                'key' => 'bimestre_1_fin',
                'value' => '2025-05-09',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de fin del primer bimestre',
            ],
            [
                'key' => 'bimestre_2_inicio',
                'value' => '2025-05-19',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de inicio del segundo bimestre',
            ],
            [
                'key' => 'bimestre_2_fin',
                'value' => '2025-07-25',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de fin del segundo bimestre',
            ],
            [
                'key' => 'bimestre_3_inicio',
                'value' => '2025-08-11',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de inicio del tercer bimestre',
            ],
            [
                'key' => 'bimestre_3_fin',
                'value' => '2025-10-10',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de fin del tercer bimestre',
            ],
            [
                'key' => 'bimestre_4_inicio',
                'value' => '2025-10-20',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de inicio del cuarto bimestre',
            ],
            [
                'key' => 'bimestre_4_fin',
                'value' => '2025-12-19',
                'type' => 'string',
                'group' => 'bimestres',
                'description' => 'Fecha de fin del cuarto bimestre',
            ],
        ];
    }

    private function getScheduleSettings(Tenant $tenant): array
    {
        $schedules = [];

        $hasAfternoonShift = \App\Models\Classroom::where('tenant_id', $tenant->id)
            ->where('shift', 'TARDE')
            ->exists();

        $schedules = array_merge($schedules, [
            [
                'key' => 'horario_inicial_manana_entrada',
                'value' => '08:00',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de entrada para nivel inicial - turno mañana',
            ],
            [
                'key' => 'horario_inicial_manana_salida',
                'value' => '12:00',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de salida para nivel inicial - turno mañana',
            ],

            [
                'key' => 'horario_primaria_manana_entrada',
                'value' => '08:00',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de entrada para nivel primaria - turno mañana',
            ],
            [
                'key' => 'horario_primaria_manana_salida',
                'value' => '13:00',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de salida para nivel primaria - turno mañana',
            ],

            [
                'key' => 'horario_secundaria_manana_entrada',
                'value' => '08:00',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de entrada para nivel secundaria - turno mañana',
            ],
            [
                'key' => 'horario_secundaria_manana_salida',
                'value' => '15:30',
                'type' => 'string',
                'group' => 'horarios',
                'description' => 'Hora de salida para nivel secundaria - turno mañana',
            ],
        ]);

        if ($hasAfternoonShift) {
            $schedules = array_merge($schedules, [
                [
                    'key' => 'horario_inicial_tarde_entrada',
                    'value' => '13:00',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de entrada para nivel inicial - turno tarde',
                ],
                [
                    'key' => 'horario_inicial_tarde_salida',
                    'value' => '17:00',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de salida para nivel inicial - turno tarde',
                ],

                [
                    'key' => 'horario_primaria_tarde_entrada',
                    'value' => '13:00',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de entrada para nivel primaria - turno tarde',
                ],
                [
                    'key' => 'horario_primaria_tarde_salida',
                    'value' => '18:00',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de salida para nivel primaria - turno tarde',
                ],

                [
                    'key' => 'horario_secundaria_tarde_entrada',
                    'value' => '13:00',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de entrada para nivel secundaria - turno tarde',
                ],
                [
                    'key' => 'horario_secundaria_tarde_salida',
                    'value' => '20:30',
                    'type' => 'string',
                    'group' => 'horarios',
                    'description' => 'Hora de salida para nivel secundaria - turno tarde',
                ],
            ]);
        }

        return $schedules;
    }

    private function displaySummary(): void
    {
        $this->command->info('');
        $this->command->info('=============================');
        $this->command->info('Resumen de Configuraciones:');
        $this->command->info('=============================');

        $summary = Setting::selectRaw('tenant_id, COUNT(*) as settings_count')
            ->groupBy('tenant_id')
            ->with('tenant:id,name')
            ->get();

        $this->command->table(
            ['Tenant', 'Configuraciones'],
            $summary->map(fn($s) => [
                $s->tenant->name,
                $s->settings_count,
            ])->toArray()
        );
    }
}