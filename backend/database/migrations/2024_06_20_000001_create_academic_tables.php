<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('padres_apoderados', function (Blueprint $table) {
            $table->id();
            
            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'CI', 'PTP'])->default('DNI');
            $table->string('document_number', 20)->unique();

            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
         
            $table->string('phone_number', 15)->nullable();
            $table->string('email', 100)->nullable()->unique();
            
            $table->enum('relationship_type', ['PADRE', 'MADRE', 'APODERADO', 'TUTOR'])->default('TUTOR');

            $table->timestamps();
            
            $table->index(['paternal_surname', 'maternal_surname']);
            $table->index('name');
        });

        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->string('dni', 8)->unique();
            $table->string('name', 100);
            $table->string('area', 30);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
            $table->string('email')->unique()->nullable();
            $table->string('phone_number', 15)->nullable();
            
            $table->timestamps();
            
            $table->index(['paternal_surname', 'maternal_surname']);
            $table->index('name');
        });

        Schema::create('aulas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')
                  ->constrained('docentes')
                  ->onDelete('restrict'); 

            $table->enum('nivel', ['INICIAL', 'PRIMARIA', 'SECUNDARIA']);
            $table->unsignedTinyInteger('grado');
            $table->string('seccion', 50);

            $table->unique(['nivel', 'grado', 'seccion']);
            
            $table->timestamps();
            $table->index('docente_id');
        });

        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            
            $table->string('qr_code', 100)->unique(); 
            $table->string('student_code', 20)->unique();
            
            $table->string('name', 100);
            $table->string('paternal_surname', 50);
            $table->string('maternal_surname', 50);
            $table->enum('document_type', ['DNI', 'CE', 'PAS', 'CI', 'PTP'])->default('DNI');
            $table->string('document_number', 20)->unique();
            $table->enum('gender', ['M', 'F'])->nullable(); 
            $table->date('date_of_birth')->nullable();
            
            $table->foreignId('aula_id')
                  ->constrained('aulas')
                  ->onDelete('restrict');
            
            $table->foreignId('padre_id')->constrained('padres_apoderados')->nullable(); 

            $table->timestamps();
            
            $table->index(['paternal_surname', 'maternal_surname']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('aulas');
        Schema::dropIfExists('estudiantes');
    }
};
