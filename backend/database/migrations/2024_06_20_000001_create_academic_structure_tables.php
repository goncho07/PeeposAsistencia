<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Niveles (Inicial, Primaria, Secundaria)
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Secundaria"
            $table->string('slug')->unique(); // e.g., "secundaria"
            $table->timestamps();
        });

        // Grados (1°, 2°, etc.)
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Quinto Grado"
            $table->integer('numeric_grade'); // e.g., 5
            $table->timestamps();
        });

        // Secciones (A, B, C)
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "A"
            $table->string('shift')->default('morning'); // morning, afternoon
            $table->year('academic_year');
            $table->foreignId('tutor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('levels');
    }
};
