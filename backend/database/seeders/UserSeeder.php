<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadmin = User::withoutGlobalScope('tenant')->updateOrCreate([
            'tenant_id' => null,
            'document_type' => 'DNI',
            'document_number' => '00000000',
            'name' => 'Peepos',
            'paternal_surname' => 'Sistema',
            'maternal_surname' => 'Global',
            'email' => 'peepos@peeposaasistencias.com',
            'password' => Hash::make('marvelrivals123'),
            'role' => 'SUPERADMIN',
            'phone_number' => '999999999',
            'status' => 'ACTIVO',
            'email_verified_at' => now(),
        ]);

        $this->command->info("SUPERADMIN creado: {$superadmin->email}");
        $this->command->warn("Password: marvelrivals123");
        $this->command->info('');

        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No hay tenants. Ejecuta TenantSeeder primero.');
            return;
        }

        $tenant1 = $tenants->firstWhere('modular_code', '0325464');

        if ($tenant1) {
            $users = [
                [
                    'document_type' => 'DNI',
                    'document_number' => '12345678',
                    'name' => 'Ricardo',
                    'paternal_surname' => 'Palma',
                    'maternal_surname' => 'Soriano',
                    'email' => 'ricardopalma@ieericardopalma.edu.pe',
                    'password' => Hash::make('$RicardoPalma123'),
                    'role' => 'DIRECTOR',
                    'phone_number' => '987654321',
                    'status' => 'ACTIVO',
                ],
            ];

            foreach ($users as $userData) {
                $userData['tenant_id'] = $tenant1->id;
                $userData['email_verified_at'] = now();

                User::updateOrCreate($userData);
            }

            $this->command->info(" Usuarios creados para: {$tenant1->name}");
        }

        $tenant2 = $tenants->firstWhere('code', '0325265');

        if ($tenant2) {
            $users = [
                [
                    'document_type' => 'DNI',
                    'document_number' => '78901234',
                    'name' => 'Francisco',
                    'paternal_surname' => 'Bolognesi',
                    'maternal_surname' => 'Cervantes',
                    'email' => 'franciscobolognesi@gmail.com',
                    'password' => Hash::make('312FranciscoBolognesi%'),
                    'role' => 'DIRECTOR',
                    'phone_number' => '976543210',
                    'status' => 'ACTIVO',
                ],
            ];

            foreach ($users as $userData) {
                $userData['tenant_id'] = $tenant2->id;
                $userData['email_verified_at'] = now();

                User::updateOrCreate($userData);
            }

            $this->command->info(" Usuarios creados para: {$tenant2->name}");
        }

        $this->command->info('');
        $this->command->info('================================');
        $this->command->info('Resumen de Usuarios Creados:');
        $this->command->info('================================');

        $allUsers = User::withoutGlobalScope('tenant')
            ->with('tenant')
            ->get();

        $this->command->table(
            ['ID', 'Email', 'Rol', 'Tenant', 'Estado'],
            $allUsers->map(fn($u) => [
                $u->id,
                $u->email,
                $u->role,
                $u->tenant?->name ?? 'N/A (SUPERADMIN)',
                $u->status,
            ])->toArray()
        );
    }
}
