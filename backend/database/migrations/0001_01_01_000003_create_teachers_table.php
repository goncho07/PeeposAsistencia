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

            $table->string('dni', 8);
            $table->string('qr_code', 50);
        
            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['M', 'F'])->nullable();

            $table->enum('level', ['INICIAL', 'PRIMARIA', 'SECUNDARIA']);
            $table->string('area', 30)->nullable();

            $table->string('email')->nullable();
            $table->string('phone_number', 15)->nullable();
        
            $table->enum('status', ['ACTIVO', 'INACTIVO', 'LICENCIA', 'CESADO'])->default('ACTIVO');

            $table->timestamps();
            
            $table->unique(['tenant_id', 'dni']);
            $table->unique(['tenant_id', 'qr_code']);
            $table->unique(['tenant_id', 'email']);

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'level']);
            $table->index(['name', 'paternal_surname', 'maternal_surname'], 'idx_teachers_search');
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
