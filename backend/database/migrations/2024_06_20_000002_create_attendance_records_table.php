<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            
            $table->morphs('attendable');
            
            $table->date('date');
            $table->time('entry_time')->nullable();
            $table->time('exit_time')->nullable();
            
            $table->enum('entry_status', [
                'ASISTIO',
                'TARDANZA', 
                'FALTA',
                'FALTA_JUSTIFICADA'
            ])->default('FALTA');
            
            $table->enum('exit_status', [
                'COMPLETO',
                'SALIDA_ANTICIPADA',
                'SALIDA_ANTICIPADA_JUSTIFICADA',
                'SIN_SALIDA'
            ])->default('SIN_SALIDA');
            
            $table->text('entry_observation')->nullable();
            $table->text('exit_observation')->nullable();
            
            $table->boolean('whatsapp_sent')->default(false);
            $table->timestamp('whatsapp_sent_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['attendable_type', 'attendable_id', 'date']);
            $table->index('date');
            $table->index(['date', 'entry_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
