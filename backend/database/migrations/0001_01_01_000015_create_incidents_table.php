<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users');

            $table->date('date');
            $table->time('time');

            $table->enum('type', [
                'USO_CELULAR',           // Uso de celular en clase
                'INTERRUPCION',          // Interrupción/bulla en clase
                'FALTA_RESPETO',         // Falta de respeto a docente o compañero
                'INCUMPLIMIENTO_TAREA',  // No presentó tarea/material
                'UNIFORME_INCOMPLETO',   // Uniforme incompleto o inadecuado
                'LLEGADA_TARDE',         // Llegada tarde a clase (no al colegio)
                'DETERIORO_MATERIAL',    // Deterioro de material/mobiliario
                'PELEA',                 // Pelea o agresión física
                'ACOSO',                 // Acoso o bullying
                'SALIDA_NO_AUTORIZADA',  // Salida del aula sin permiso
                'OTRO',                  // Otro tipo de incidencia
            ]);

            $table->enum('severity', [
                'LEVE',      // Amonestación verbal, registro
                'MODERADA',  // Citación a padre/apoderado
                'GRAVE',     // Suspensión temporal, informe a dirección
            ])->default('LEVE');

            $table->text('description')->nullable(); // Detalles adicionales opcionales

            $table->enum('status', [
                'REGISTRADA',    // Recién registrada
                'EN_SEGUIMIENTO', // Se está dando seguimiento
                'RESUELTA',      // Ya se resolvió
            ])->default('REGISTRADA');

            $table->text('resolution_notes')->nullable(); // Notas de resolución
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'classroom_id', 'date']);
            $table->index(['tenant_id', 'student_id', 'date']);
            $table->index(['tenant_id', 'date', 'severity']);
            $table->index(['tenant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
