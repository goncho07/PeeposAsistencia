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
        Schema::create('students', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->string('qr_code', 50);
            $table->string('student_code', 20);
            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'CI', 'PTP'])->default('DNI');
            $table->string('document_number', 20);

            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
            $table->enum('gender', ['M', 'F'])->nullable();
            $table->date('birth_date')->nullable();
            $table->string('nationality', 50)->default('PERUANA');
            $table->string('photo_url')->nullable();

            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('restrict');
            $table->year('academic_year')->default(2025);
            $table->enum('enrollment_status', ['MATRICULADO', 'RETIRADO', 'TRASLADADO', 'EGRESADO'])->default('MATRICULADO');

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'qr_code']);
            $table->unique(['tenant_id', 'student_code']);
            $table->unique(['tenant_id', 'document_number']);

            $table->index(['tenant_id', 'classroom_id']);
            $table->index(['tenant_id', 'academic_year']);
            $table->index(['tenant_id', 'enrollment_status']);
            $table->index(['name', 'paternal_surname', 'maternal_surname'], 'idx_students_search');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
