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
        Schema::create('student_parent', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('parents')->onDelete('cascade');

            $table->enum('relationship_type', ['PADRE', 'MADRE', 'APODERADO']);
            $table->string('custom_relationship_label', 50)->nullable()->comment('Etiqueta personalizada cuando relationship_type es APODERADO');

            $table->boolean('is_primary_contact')->default(false);
            $table->boolean('receives_notifications')->default(true);

            $table->timestamps();

            $table->unique(['tenant_id', 'student_id', 'parent_id']);

            $table->index(['tenant_id', 'student_id']);
            $table->index(['tenant_id', 'parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_parent');
    }
};
