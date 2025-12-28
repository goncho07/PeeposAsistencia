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
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->index(['tokenable_type', 'tokenable_id'], 'idx_tokenable');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['id', 'tenant_id'], 'idx_user_tenant');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->index(['id', 'is_active'], 'idx_tenant_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('idx_tokenable');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_user_tenant');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex('idx_tenant_active');
        });
    }
};
