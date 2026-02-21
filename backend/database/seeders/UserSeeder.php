<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadminPassword = $this->resolvePassword('SEED_SUPERADMIN_PASSWORD');
        $directorPassword        = $this->resolvePassword('SEED_DIRECTOR_PASSWORD');
        $scannerPassword    = $this->resolvePassword('SEED_SCANNER_PASSWORD');

        $superadmin = User::withoutGlobalScope('tenant')->updateOrCreate(
            ['document_number' => '00000000', 'tenant_id' => null],
            [
                'document_type'     => 'DNI',
                'name'              => 'Peepos',
                'paternal_surname'  => 'Sistema',
                'maternal_surname'  => 'Intelicole',
                'email'             => env('SEED_SUPERADMIN_EMAIL', 'intelicolelocambiatodo@gmail.com'),
                'password'          => Hash::make($superadminPassword),
                'role'              => 'SUPERADMIN',
                'phone_number'      => '999999999',
                'status'            => 'ACTIVO',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("SUPERADMIN: {$superadmin->email}");

        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->command->error('No hay tenants. Ejecuta TenantSeeder primero.');
            return;
        }

        $tenant1 = $tenants->firstWhere('modular_code', '0325464');

        if ($tenant1) {
            User::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant1->id, 'document_number' => '12345678'],
                [
                    'document_type'     => 'DNI',
                    'name'              => 'Ricardo',
                    'paternal_surname'  => 'Palma',
                    'maternal_surname'  => 'Soriano',
                    'email'             => 'ricardopalma@' . $tenant1->slug . '.edu.pe',
                    'password'          => Hash::make($directorPassword),
                    'role'              => 'DIRECTOR',
                    'phone_number'      => '987654321',
                    'status'            => 'ACTIVO',
                    'email_verified_at' => now(),
                ]
            );

            $this->command->info("DIRECTOR creado para: {$tenant1->name}");
        }

        $tenant2 = $tenants->firstWhere('modular_code', '0325265');

        if ($tenant2) {
            User::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant2->id, 'document_number' => '78901234'],
                [
                    'document_type'     => 'DNI',
                    'name'              => 'Francisco',
                    'paternal_surname'  => 'Bolognesi',
                    'maternal_surname'  => 'Cervantes',
                    'email'             => 'franciscobolognesi@' . $tenant2->slug . '.edu.pe',
                    'password'          => Hash::make($directorPassword),
                    'role'              => 'DIRECTOR',
                    'phone_number'      => '976543210',
                    'status'            => 'ACTIVO',
                    'email_verified_at' => now(),
                ]
            );

            $this->command->info("DIRECTOR creado para: {$tenant2->name}");
        }

        $this->seedScannerUsers($tenants, $scannerPassword);

        $this->command->info('');
        $this->command->info('════════════════════════════════════════');
        $this->command->info('  Credenciales generadas en este seed  ');
        $this->command->info('════════════════════════════════════════');
        $this->command->table(
            ['Variable env', 'Password usada'],
            [
                ['SEED_SUPERADMIN_PASSWORD', $superadminPassword],
                ['SEED_DIRECTOR_PASSWORD',        $directorPassword],
                ['SEED_SCANNER_PASSWORD',    $scannerPassword],
            ]
        );
        $this->command->warn('Guarda estas passwords si fueron generadas automáticamente.');
        $this->command->info('');

        $allUsers = User::withoutGlobalScope('tenant')->with('tenant')->get();

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

    private function resolvePassword(string $envKey): string
    {
        $value = env($envKey);

        if (! $value) {
            $value = Str::password(20, symbols: true);
            $this->command->warn("{$envKey} no definida — password generada automáticamente.");
        }

        return $value;
    }

    private function seedScannerUsers($tenants, string $scannerPassword): void
    {
        $levelMap = [
            'INICIAL'    => [['Inicial',    'I']],
            'PRIMARIA'   => [['Primaria',   'P']],
            'SECUNDARIA' => [['Secundaria', 'S']],
            'MULTIPLE'   => [
                ['Inicial',    'I'],
                ['Primaria',   'P'],
                ['Secundaria', 'S'],
            ],
        ];

        $this->command->info('');
        $this->command->info('Creando usuarios ESCANER...');

        foreach ($tenants as $tenant) {
            $scanners = $levelMap[$tenant->level] ?? [];

            if (empty($scanners)) {
                $this->command->warn("Tenant {$tenant->name}: nivel '{$tenant->level}' no reconocido, sin escaners.");
                continue;
            }

            foreach ($scanners as [$levelLabel, $levelCode]) {
                $docNumber = 'SCN-' . $tenant->modular_code . '-' . $levelCode;

                User::withoutGlobalScope('tenant')->updateOrCreate(
                    [
                        'tenant_id'       => $tenant->id,
                        'document_number' => $docNumber,
                    ],
                    [
                        'document_type'     => 'DNI',
                        'name'              => 'Escáner',
                        'paternal_surname'  => $levelLabel,
                        'maternal_surname'  => '',
                        'email'             => 'escaner.' . strtolower($levelLabel) . '@' . $tenant->slug . '.scan',
                        'password'          => Hash::make($scannerPassword),
                        'role'             => 'ESCANER',
                        'status'           => 'ACTIVO',
                        'email_verified_at' => now(),
                    ]
                );

                $this->command->line("  Escáner {$levelLabel} → {$tenant->name}");
            }
        }
    }
}
