<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = [
            [
                'code' => '0325464',
                'name' => 'I.E.E 6049 Ricardo Palma',
                'slug' => 'iee-6049-ricardo-palma',
                'ruc' => '20506159360',
                'institution_type' => 'ESTATAL',
                'level' => 'MULTIPLE',
                'email' => 'mesadepartes@ieericardopalma.edu.pe',
                'phone' => '016527062',
                'address' => 'Av. Angamos Este S/N',
                'department' => 'LIMA',
                'province' => 'LIMA',
                'district' => 'SURQUILLO',
                'ugel' => '07',
                'ubigeo' => '150141',
                'timezone' => 'America/Lima',
                'is_active' => true,
                'logo_url' => 'tenants/iee-6049-ricardo-palma/logo.png',
                'banner_url' => 'tenants/iee-6049-ricardo-palma/banner.png',
                'background_url' => 'tenants/iee-6049-ricardo-palma/background.jpg',
            ],
            [
                'code' => '0325265',
                'name' => 'I.E Francisco Bolognesi Cervantes',
                'slug' => 'ie-francisco-bolognesi-cervantes',
                'ruc' => '00000000001',
                'institution_type' => 'ESTATAL',
                'level' => 'MULTIPLE',
                'email' => 'mesadepartesiefbc@gmail.com',
                'phone' => '3870750',
                'address' => 'Avenida Francisco Bolognesi S/N',
                'department' => 'LIMA',
                'province' => 'LIMA',
                'district' => 'SAN JUAN DE LURIGANCHO',
                'ugel' => '05',
                'ubigeo' => '150132',
                'timezone' => 'America/Lima',
                'is_active' => true,
                'logo_url' => 'tenants/ie-francisco-bolognesi-cervantes/logo.png',
                'banner_url' => 'tenants/ie-francisco-bolognesi-cervantes/banner.png',
                'background_url' => 'tenants/ie-francisco-bolognesi-cervantes/background.jpg',
                'primary_color' => '#3C356B',
            ],
        ];

        foreach ($tenants as $tenantData) {
            $tenant = Tenant::updateOrCreate(
                ['code' => $tenantData['code']],
                $tenantData
            );

            $action = $tenant->wasRecentlyCreated ? 'creado' : 'actualizado';
            $this->command->info("Tenant {$action}: {$tenantData['name']}");
        }

        $this->command->info('');
        $this->command->info('================================');
        $this->command->info('Resumen de Tenants Creados:');
        $this->command->info('================================');
        $this->command->table(
            ['ID', 'Código', 'Nombre', 'Estado', 'Nivel'],
            Tenant::all()->map(fn($t) => [
                $t->id,
                $t->code,
                $t->name,
                $t->level,
            ])->toArray()
        );
    }
}
