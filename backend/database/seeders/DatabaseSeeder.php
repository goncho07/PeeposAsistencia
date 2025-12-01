<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin Principal
        User::updateorcreate([
            'name' => 'Lisha Lokwani',
            'email' => 'admin@peepos.edu.pe',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'dni' => '12345678',
            'phone' => '999888777',
            'status' => 'active'
        ]);

        // Generar Docentes
        $teachers = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Pedro Sanchez'];
        foreach ($teachers as $i => $name) {
            User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@peepos.edu.pe',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'dni' => '10000000' . $i,
                'phone' => '90000000' . $i,
                'status' => 'active'
            ]);
        }

        // Generar Estudiantes
        // Inicial
        $this->createStudents('Inicial', '3 Años', ['MARGARITAS', 'CRISANTEMOS'], 15);
        $this->createStudents('Inicial', '4 Años', ['ROSAS', 'LIRIOS'], 15);
        $this->createStudents('Inicial', '5 Años', ['GIRASOLES', 'TULIPANES'], 15);

        // Primaria (Muestra)
        $this->createStudents('Primaria', '1ro Grado', ['A', 'B'], 20);
        $this->createStudents('Primaria', '5to Grado', ['A', 'B'], 20);

        // Secundaria (Muestra)
        $this->createStudents('Secundaria', '3ro Año', ['A', 'B'], 20);
        $this->createStudents('Secundaria', '5to Año', ['A', 'B'], 20);
    }

    private function createStudents($level, $grade, $sections, $count)
    {
        $faker = \Faker\Factory::create('es_PE');
        
        for ($i = 0; $i < $count; $i++) {
            $section = $sections[array_rand($sections)];
            User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'role' => 'student',
                'dni' => $faker->unique()->numerify('########'),
                'level' => $level,
                'grade' => $grade,
                'section' => $section,
                'status' => $faker->randomElement(['active', 'active', 'active', 'inactive']),
                'phone' => $faker->phoneNumber
            ]);
        }
    }
}
