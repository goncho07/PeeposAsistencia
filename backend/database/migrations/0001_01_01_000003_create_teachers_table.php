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

            $table->timestamps();
            $table->softDeletes();

            $table->unique('user_id');
            $table->unique(['tenant_id', 'qr_code']);

            $table->index(['tenant_id', 'level']);
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
