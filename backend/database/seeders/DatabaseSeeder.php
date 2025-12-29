<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('╔════════════════════════════════════════════╗');
        $this->command->info('║   PEEPOS ASISTENCIA - DATABASE SEEDER     ║');
        $this->command->info('╚════════════════════════════════════════════╝');
        $this->command->info('');

        // 1. Tenants (primero porque otros seeders dependen de ellos)
        $this->command->warn('→ Paso 1/5: Creando Tenants...');
        $this->call(TenantSeeder::class);
        $this->command->info('✓ Tenants creados correctamente');
        $this->command->info('');

        // 2. Classrooms (depende de Tenants)
        $this->command->warn('→ Paso 2/5: Creando Aulas...');
        $this->call(ClassroomSeeder::class);
        $this->command->info('✓ Aulas creadas correctamente');
        $this->command->info('');

        // 3. Settings (depende de Tenants y Classrooms)
        $this->command->warn('→ Paso 3/5: Configurando Horarios y Bimestres...');
        $this->call(SettingSeeder::class);
        $this->command->info('✓ Configuraciones creadas correctamente');
        $this->command->info('');

        // 4. Users (depende de Tenants)
        $this->command->warn('→ Paso 4/5: Creando Usuarios...');
        $this->call(UserSeeder::class);
        $this->command->info('✓ Usuarios creados correctamente');
        $this->command->info('');

        // 5. Peepos (depende de Tenants y Classrooms)
        $this->command->warn('→ Paso 5/5: Cargando datos desde CSV (Estudiantes y Docentes)...');
        $this->call(PeeposSeeder::class);
        $this->command->info('✓ Datos de CSV cargados correctamente');
        $this->command->info('');

        // Resumen final
        $this->command->info('');
        $this->command->info('╔════════════════════════════════════════════╗');
        $this->command->info('║          ✓ SEEDING COMPLETADO              ║');
        $this->command->info('╚════════════════════════════════════════════╝');
        $this->command->info('');
        $this->command->line('  La base de datos ha sido poblada exitosamente.');
        $this->command->line('  Puedes iniciar sesión con las credenciales creadas.');
        $this->command->info('');
    }
}
