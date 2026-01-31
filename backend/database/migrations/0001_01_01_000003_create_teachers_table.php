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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->string('qr_code', 50);

            $table->enum('level', ['INICIAL', 'PRIMARIA', 'SECUNDARIA']);
            $table->string('specialty', 100)->nullable()->comment('Especialidad: Matemática, Comunicación, etc.');
            $table->enum('contract_type', ['NOMBRADO', 'CONTRATADO', 'CAS', 'PRACTICANTE'])->default('CONTRATADO');
            $table->date('hire_date')->nullable();

            $table->enum('status', ['ACTIVO', 'INACTIVO', 'LICENCIA', 'CESADO'])->default('ACTIVO');

            $table->timestamps();
            $table->softDeletes();

            $table->unique('user_id');
            $table->unique(['tenant_id', 'qr_code']);

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'level']);
            $table->index(['tenant_id', 'contract_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
