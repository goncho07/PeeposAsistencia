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
        Schema::create('classroom_teacher', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');

            $table->string('subject', 50)->nullable();
            $table->year('academic_year')->default(2025);

            $table->json('schedule')->nullable();

            $table->timestamps();

            $table->unique(['tenant_id', 'classroom_id', 'teacher_id', 'subject', 'academic_year'], 'unique_classroom_teacher_subject');

            $table->index(['tenant_id', 'classroom_id']);
            $table->index(['tenant_id', 'teacher_id']);
            $table->index(['tenant_id', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classroom_teacher');
    }
};
