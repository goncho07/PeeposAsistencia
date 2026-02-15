<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('current_academic_year_id')
                ->nullable()
                ->after('timezone')
                ->constrained('academic_years')
                ->nullOnDelete();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('academic_year_id')
                ->nullable()
                ->after('academic_year')
                ->constrained('academic_years')
                ->nullOnDelete();

            $table->index(['tenant_id', 'academic_year_id']);
        });

        Schema::table('classroom_teacher', function (Blueprint $table) {
            $table->foreignId('academic_year_id')
                ->nullable()
                ->after('academic_year')
                ->constrained('academic_years')
                ->nullOnDelete();

            $table->index(['tenant_id', 'academic_year_id']);
        });

        Schema::table('incidents', function (Blueprint $table) {
            $table->foreignId('academic_year_id')
                ->nullable()
                ->after('tenant_id')
                ->constrained('academic_years')
                ->nullOnDelete();

            $table->index(['tenant_id', 'academic_year_id']);
        });

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->foreignId('academic_year_id')
                ->nullable()
                ->after('tenant_id')
                ->constrained('academic_years')
                ->nullOnDelete();

            $table->index(['academic_year_id']);
        });
    }

    public function down(): void
    {
        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropIndex(['academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('incidents', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropIndex(['tenant_id', 'academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('classroom_teacher', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropIndex(['tenant_id', 'academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropIndex(['tenant_id', 'academic_year_id']);
            $table->dropColumn('academic_year_id');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['current_academic_year_id']);
            $table->dropColumn('current_academic_year_id');
        });
    }
};
