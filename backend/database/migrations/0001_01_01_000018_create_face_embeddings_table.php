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
        Schema::create('face_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->morphs('embeddable');
            $table->string('external_id', 100)->comment('Reference ID for face service: student_123 or teacher_456');
            $table->enum('status', ['ACTIVE', 'PENDING', 'FAILED', 'NO_FACE'])->default('PENDING');
            $table->text('error_message')->nullable();
            $table->string('source_image_url', 500)->nullable()->comment('Photo URL used for enrollment');
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'embeddable_type', 'embeddable_id'], 'unique_face_per_entity');
            $table->index('external_id');
            $table->index(['tenant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('face_embeddings');
    }
};
