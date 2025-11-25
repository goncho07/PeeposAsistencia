<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Estudiante
            $table->foreignId('section_id')->constrained()->onDelete('cascade'); // Sección en ese momento
            
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            
            // Estado: present, late, absent, excused
            $table->enum('status', ['present', 'late', 'absent', 'excused'])->default('absent');
            
            $table->text('remarks')->nullable(); // Justificaciones u observaciones
            $table->string('recorded_by_type')->nullable(); // 'system' (QR), 'manual' (Profesor/Auxiliar)
            $table->unsignedBigInteger('recorded_by_id')->nullable(); // ID del usuario que registró manualmente
            
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['user_id', 'date']);
            $table->index(['section_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
