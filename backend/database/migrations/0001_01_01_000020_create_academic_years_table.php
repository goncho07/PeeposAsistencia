<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->year('year');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['PLANIFICADO', 'ACTIVO', 'FINALIZADO'])->default('PLANIFICADO');
            $table->boolean('is_current')->default(false);

            $table->timestamps();

            $table->unique(['tenant_id', 'year']);
            $table->index(['tenant_id', 'is_current']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
