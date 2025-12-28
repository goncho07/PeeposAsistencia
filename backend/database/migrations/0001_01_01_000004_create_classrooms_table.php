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
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->foreignId('teacher_id')
                ->nullable()
                ->constrained('teachers')
                ->onDelete('set null');

            $table->enum('level', ['INICIAL', 'PRIMARIA', 'SECUNDARIA']);
            $table->unsignedTinyInteger('grade');
            $table->string('section', 50);

            $table->enum('shift', ['MAÑANA', 'TARDE', 'NOCHE'])->nullable();

            $table->enum('status', ['ACTIVO', 'INACTIVO', 'CERRADO'])->default('ACTIVO');

            $table->timestamps();

            $table->unique(['tenant_id', 'level', 'grade', 'section', 'shift'], 'unique_classroom');

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'level', 'grade']);
            $table->index(['tenant_id', 'teacher_id']);
            $table->index(['tenant_id', 'shift']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
