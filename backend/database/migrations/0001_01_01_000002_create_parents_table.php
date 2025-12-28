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
        Schema::create('parents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'CI', 'PTP'])->default('DNI');
            $table->string('document_number', 20);

            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);

            $table->string('phone_number', 15)->nullable();
            $table->string('email', 100)->nullable();

            $table->timestamps();

            $table->unique(['tenant_id', 'document_number']);
            $table->unique(['tenant_id', 'email']);
            
            $table->index(['name', 'paternal_surname', 'maternal_surname'], 'idx_parents_search');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};
