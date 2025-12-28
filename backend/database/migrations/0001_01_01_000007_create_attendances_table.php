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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->morphs('attendable');

            $table->date('date');

            $table->enum('shift', ['MAÑANA', 'TARDE', 'NOCHE'])->nullable();
            $table->time('entry_time')->nullable();
            $table->time('exit_time')->nullable();

            $table->enum('entry_status', ['COMPLETO', 'TARDANZA', 'FALTA', 'FALTA_JUSTIFICADA'])->default('FALTA');
            $table->enum('exit_status', ['COMPLETO', 'SALIDA_ANTICIPADA', 'SALIDA_ANTICIPADA_JUSTIFICADA', 'SIN_SALIDA'])->default('SIN_SALIDA');

            $table->text('entry_observation')->nullable();
            $table->text('exit_observation')->nullable();

            $table->boolean('whatsapp_sent')->default(false);
        
            $table->timestamps();

            $table->index(['tenant_id', 'date']);
            $table->index(['tenant_id', 'attendable_type', 'attendable_id', 'date']);
            $table->index(['tenant_id', 'date', 'entry_status']);
            $table->index(['tenant_id', 'shift', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
