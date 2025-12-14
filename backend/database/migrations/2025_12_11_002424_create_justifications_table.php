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
        Schema::create('justificaciones', function (Blueprint $table) {
            $table->id();

            $table->morphs('justifiable');

            $table->date('date_from');
            $table->date('date_to');

            $table->enum('type', ['FALTA', 'SALIDA_ANTICIPADA']);
            $table->text('reason');
            $table->string('document_path')->nullable();

            $table->foreignId('created_by')->constrained('users');

            $table->enum('status', ['PENDIENTE', 'APROBADA', 'RECHAZADA'])->default('PENDIENTE');
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            $table->index(['date_from', 'date_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('justificaciones');
    }
};
