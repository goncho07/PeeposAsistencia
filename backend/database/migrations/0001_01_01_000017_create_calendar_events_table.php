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
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');

            $table->string('title', 100);
            $table->text('description')->nullable();

            $table->enum('type', [
            'FESTIVIDAD_NACIONAL',
                'FESTIVIDAD_REGIONAL',
                'FERIADO',
                'EVENTO_ESCOLAR',
                'ADMINISTRATIVO',
            ])->default('EVENTO_ESCOLAR');

            $table->date('event_date');
            $table->date('end_date')->nullable();

            $table->boolean('is_recurring')->default(false);
            $table->boolean('is_non_working_day')->default(false);

            $table->string('color', 7)->default('#3B82F6');

            $table->timestamps();

            $table->index(['tenant_id', 'event_date']);
            $table->index(['event_date', 'type']);
            $table->index('is_recurring');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
