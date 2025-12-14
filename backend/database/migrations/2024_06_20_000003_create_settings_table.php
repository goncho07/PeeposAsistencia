<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ajustes', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->string('group')->default('general');
            $table->timestamps();
        });

        $defaultSettings = [
            ['key' => 'whatsapp_inicial_phone', 'value' => '', 'type' => 'string', 'group' => 'whatsapp'],
            ['key' => 'whatsapp_primaria_phone', 'value' => '', 'type' => 'string', 'group' => 'whatsapp'],
            ['key' => 'whatsapp_secundaria_phone', 'value' => '', 'type' => 'string', 'group' => 'whatsapp'],
            ['key' => 'whatsapp_notifications_enabled', 'value' => 'true', 'type' => 'boolean', 'group' => 'whatsapp'],

            ['key' => 'attendance_days', 'value' => json_encode(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']), 'type' => 'json', 'group' => 'general'],

            ['key' => 'tardiness_tolerance_minutes', 'value' => '5', 'type' => 'integer', 'group' => 'general'],

            ['key' => 'timezone', 'value' => 'America/Lima', 'type' => 'string', 'group' => 'general'],

            ['key' => 'horario_inicial_entrada', 'value' => '08:00', 'type' => 'string', 'group' => 'horarios'],
            ['key' => 'horario_inicial_salida', 'value' => '12:00', 'type' => 'string', 'group' => 'horarios'],
            ['key' => 'horario_primaria_entrada', 'value' => '08:00', 'type' => 'string', 'group' => 'horarios'],
            ['key' => 'horario_primaria_salida', 'value' => '13:00', 'type' => 'string', 'group' => 'horarios'],
            ['key' => 'horario_secundaria_entrada', 'value' => '08:00', 'type' => 'string', 'group' => 'horarios'],
            ['key' => 'horario_secundaria_salida', 'value' => '15:30', 'type' => 'string', 'group' => 'horarios'],

            ['key' => 'bimestre_1_inicio', 'value' => '2025-03-03', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_1_fin', 'value' => '2025-05-09', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_2_inicio', 'value' => '2025-05-19', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_2_fin', 'value' => '2025-07-25', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_3_inicio', 'value' => '2025-08-11', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_3_fin', 'value' => '2025-10-10', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_4_inicio', 'value' => '2025-10-20', 'type' => 'string', 'group' => 'bimestres'],
            ['key' => 'bimestre_4_fin', 'value' => '2025-12-19', 'type' => 'string', 'group' => 'bimestres'],
        ];

        DB::table('ajustes')->insert($defaultSettings);
    }

    public function down(): void
    {
        Schema::dropIfExists('ajustes');
    }
};
