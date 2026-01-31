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
        $this->command->warn('Cargando eventos del calendario...');
        $this->call(CalendarEventSeeder::class);
        $this->command->info('Eventos del calendario cargados correctamente');
        $this->command->info('');

        $this->command->warn('Cargando datos desde CSV...');
        $this->call(CsvSeeder::class);
        $this->command->info('Datos de CSV cargados correctamente');
        $this->command->info('');
    }
}
