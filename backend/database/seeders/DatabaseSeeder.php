<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Ricardo',
            'paternal_surname' => 'Palma',
            'maternal_surname' => '',
            'email' => 'ricardopalma@ricardopalma.edu.pe',
            'password' => Hash::make('RicardoPalma123!'),
            'rol' => 'DIRECTOR',
            'dni' => '12345678',
            'avatar_url' => null,
            'phone_number' => '987654321',
            'status' => 'ACTIVO',
        ]);
    }
}
