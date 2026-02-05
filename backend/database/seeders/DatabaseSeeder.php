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
        $this->command->warn('Cargando tenants predeterminados...');
        $this->call(TenantSeeder::class);
        $this->command->info('');

        $this->command->warn('Cargando usuarios del sistema...');
        $this->call(UserSeeder::class);
        $this->command->info('');

        $this->command->warn('Cargando aulas de cada tenant...');
        $this->call(ClassroomSeeder::class);
        $this->command->info('');

        $this->command->warn('Cargando eventos del calendario...');
        $this->call(CalendarEventSeeder::class);
        $this->command->info('');

        $this->command->warn('Cargando configuraciones predeterminadas de cada tenant...');
        $this->call(SettingSeeder::class);
        $this->command->info('');
    }
}
