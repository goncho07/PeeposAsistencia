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
                'USO_CELULAR',
                'INTERRUPCION',
                'FALTA_RESPETO',
                'INCUMPLIMIENTO_TAREA',
                'DESOBEDIENCIA',
                'CONVERSACION_EXCESIVA',
                'UNIFORME_INCOMPLETO',
                'LLEGADA_TARDE',
                'AUSENCIA_INJUSTIFICADA',
                'SALIDA_NO_AUTORIZADA',
                'PELEA',
                'ACOSO',
                'DISCRIMINACION',
                'ROBO',
                'AMENAZA',
                'VANDALISMO',
                'POSESION_SUSTANCIAS',
                'CONSUMO_SUSTANCIAS',
                'ARMA_PELIGROSA',
                'FUEGO_PELIGROSO',
                'USO_RED_SOCIAL_INADECUADO',
                'PLAGIO',
                'TRAMPA_EVALUACION',
                'DETERIORO_MATERIAL',
                'ACTITUD_DESCUIDADA'
            ]);

            $table->enum('severity', ['LEVE', 'MODERADA', 'GRAVE'])->default('LEVE');

            $table->text('description')->nullable();

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
