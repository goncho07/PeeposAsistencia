<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('face_match_confidence', 5, 2)
                ->nullable()
                ->after('device_type');
        });

        DB::statement("ALTER TABLE attendances MODIFY COLUMN device_type ENUM('SCANNER', 'MANUAL', 'APP', 'IMPORTACION', 'BIOMETRIC') DEFAULT 'SCANNER'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('face_match_confidence');
        });

        DB::statement("ALTER TABLE attendances MODIFY COLUMN device_type ENUM('SCANNER', 'MANUAL', 'APP', 'IMPORTACION') DEFAULT 'SCANNER'");
    }
};
