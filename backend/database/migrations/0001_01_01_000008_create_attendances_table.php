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
            $table->enum('entry_status', ['COMPLETO', 'TARDANZA', 'FALTA', 'FALTA_JUSTIFICADA'])->default('FALTA');

            $table->time('exit_time')->nullable();
            $table->enum('exit_status', ['COMPLETO', 'SALIDA_ANTICIPADA', 'SALIDA_ANTICIPADA_JUSTIFICADA', 'SIN_SALIDA'])->default('SIN_SALIDA');
    
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('device_type', ['SCANNER', 'MANUAL', 'APP', 'IMPORTACION'])->default('SCANNER');

            $table->boolean('whatsapp_sent')->default(false);
            
            $table->timestamps();

            $table->index(['tenant_id', 'date']);
            $table->index(['tenant_id', 'attendable_type', 'attendable_id', 'date'], 'idx_attendance_entity_date');
            $table->index(['tenant_id', 'date', 'entry_status']);
            $table->index(['tenant_id', 'shift', 'date']);
            $table->index(['tenant_id', 'recorded_by']);
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
