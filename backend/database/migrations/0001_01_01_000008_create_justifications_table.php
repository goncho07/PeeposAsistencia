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
        Schema::create('justifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->morphs('justifiable');

            $table->date('date_from');
            $table->date('date_to');

            $table->enum('type', ['FALTA', 'SALIDA_ANTICIPADA', 'TARDANZA']);
            $table->text('reason');
            $table->string('document_path')->nullable();

            $table->foreignId('created_by')->constrained('users');

            $table->timestamps();

            $table->index(['tenant_id', 'date_from', 'date_to']);
            $table->index(['tenant_id', 'justifiable_type', 'justifiable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('justifications');
    }
};
