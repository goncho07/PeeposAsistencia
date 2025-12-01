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
            $table->foreignId('student_id')->constrained('estudiantes')->onDelete('cascade'); 
            $table->foreignId('scanner_user_id')->constrained('users')->onDelete('restrict');
            
            $table->dateTime('scanned_at'); 
            $table->enum('record_type', ['ENTRADA', 'SALIDA'])->default('ENTRADA');
            
            $table->text('observation')->nullable(); 
            
            $table->timestamps();
            
            $table->index(['student_id', 'scanned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
