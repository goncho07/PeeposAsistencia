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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');

            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'CI', 'PTP'])->default('DNI');
            $table->string('document_number', 20)->nullable();

            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
            $table->string('photo_url')->nullable();

            $table->string('email');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            $table->enum('role', ['SUPERADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'SECRETARIO', 'COORDINADOR', 'AUXILIAR', 'DOCENTE', 'ESCANER'])->default('ESCANER');

            $table->string('phone_number', 15)->nullable();
            $table->string('qr_code', 50)->nullable();
            $table->enum('status', ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])->default('ACTIVO');

            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'document_number']);
            $table->unique(['tenant_id', 'email']);
            $table->unique(['tenant_id', 'qr_code']);

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'role']);
            $table->index(['id', 'tenant_id'], 'idx_user_tenant');
            $table->index(['name', 'paternal_surname', 'maternal_surname'], 'idx_users_search');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
    }
};
