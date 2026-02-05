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
                'USO_JOYAS',
                'UÑAS_PINTADAS',
                'CABELLO_SUELTO',
                'FALTA_ASEO_PERSONAL',
                'UNIFORME_INCOMPLETO',
                'NO_TRAJO_UTILes',
                'INCUMPLIMIENTO_TAREAS',
                'INDISCIPLINA_FORMACION',
                'INDISCIPLINA_AULA',
                'FALTA_RESPETO_SIMBOLOS_PATRIOS',
                'FALTA_RESPETO_DOCENTE',
                'AGRESION_VERBAL',
                'USO_CELULAR',
                'DAÑO_INFRAESTRUCTURA',
                'ESCANDALO_AULA',
                'SALIDA_NO_AUTORIZADA',
                'AGRESION_FISICA',
                'ACOSO_ESCOLAR',
                'CONSUMO_DROGAS',
                'PORTE_ARMAS'
            ]);

            $table->enum('severity', ['LEVE', 'MODERADA', 'GRAVE'])->default('LEVE');

            $table->text('description')->nullable();

            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['tenant_id', 'classroom_id', 'date']);
            $table->index(['tenant_id', 'student_id', 'date']);
            $table->index(['tenant_id', 'date', 'severity']);
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
