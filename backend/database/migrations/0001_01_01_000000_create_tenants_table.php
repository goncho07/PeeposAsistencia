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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();

            $table->string('modular_code', 7)->nullable()->unique()->comment('Código modular MINEDU');
            $table->string('slug', 100)->unique();
            $table->string('ruc', 11)->nullable()->unique();

            $table->string('name', 200);
            $table->string('director_name', 150)->nullable();
            $table->year('founded_year')->nullable();
            $table->enum('institution_type', ['ESTATAL', 'PRIVADO', 'PARROQUIAL'])->default('ESTATAL');
            $table->enum('level', ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'MULTIPLE'])->default('MULTIPLE');

            $table->string('email', 100)->nullable();
            $table->string('phone', 15)->nullable();
            $table->string('address', 255)->nullable();

            $table->string('department', 50)->default('LIMA');
            $table->string('province', 50)->default('LIMA');
            $table->string('district', 50);
            $table->string('ugel')->nullable();
            $table->string('ubigeo', 6)->nullable();

            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('background_url')->nullable();
            $table->string('primary_color', 7)->default('#FFFFFF');
            $table->string('timezone', 50)->default('America/Lima');

            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('modular_code');
            $table->index('slug');
            $table->index('district');
            $table->index(['id', 'is_active'], 'idx_tenant_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
