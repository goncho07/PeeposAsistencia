<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Aula;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use League\Csv\Reader;
use Carbon\Carbon;

class PeeposSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $filePath = database_path('seeders/data/peepos.csv');

        if (!file_exists($filePath)) {
            $this->command->error("Archivo CSV no encontrado: {$filePath}");
            return;
        }

        $csv = Reader::createFromFileObject(new \SplFileObject($filePath, 'r'));
        $csv->setHeaderOffset(0);

        $records = $csv->getRecords();

        $count = 0;
        $warnings = 0;
        $errors = 0;

        $this->command->info("📘 Iniciando carga desde {$filePath}");

        foreach ($records as $index => $row) {
            try {
                $rol = trim($row['ROL'] ?? '');

                match (strtolower($rol)) {
                    'administrador' => $this->createAdmin($row),
                    'docente' => $this->createTeacher($row),
                    'estudiante' => $this->createStudent($row),
                    default => function () use ($rol, &$warnings) {
                        $this->command->warn("⚠️ Fila omitida (#{$warnings}): Rol desconocido '{$rol}'");
                        $warnings++;
                    },
                };

                $count++;
            } catch (\Throwable $e) {
                $errors++;
                $this->command->error("❌ Error en fila {$index}: " . $e->getMessage());
            }
        }

        $this->command->info("Peepos - Seed completado.");
        $this->command->line("   - Registros procesados: {$count}");
        $this->command->line("   - Advertencias: {$warnings}");
        $this->command->line("   - Errores: {$errors}");
    }

    private function createAdmin(array $row): void
    {
        $dni = $this->resolveDocumentNumber($row);
        $email = strtolower(Str::slug($row['NOMBRES'] . '.' . $dni)) . '@ricardopalma.edu.pe';

        User::updateOrCreate(
            ['dni' => $dni],
            [
                'name' => trim($row['NOMBRES'] ?? ''),
                'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
                'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
                'email' => $email,
                'password' => Hash::make('RicardoPalma123!'),
                'rol' => 'ADMINISTRADOR',
                'status' => 'ACTIVO',
            ]
        );
    }

    private function createTeacher(array $row): void
    {
        $dni = $this->resolveDocumentNumber($row);

        Docente::updateOrCreate(
            ['dni' => $dni],
            [
                'qr_code' => $this->generateQRCode($dni),
                'name' => trim($row['NOMBRES'] ?? ''),
                'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
                'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
                'email' => null,
                'phone_number' => null,
                'area' => trim($row['AREÁ CURRICULAR'] ?? ''),
                'nivel' => strtoupper(trim($row['ETAPA'] ?? '')),
            ]
        );
    }

    private function createStudent(array $row): void
    {
        $dni = $this->resolveDocumentNumber($row);
        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));
        [$grado, $seccion] = $this->parseSection($row['SECCIÓN'] ?? '', $nivel);

        $aula = Aula::where('nivel', $nivel)
            ->where('grado', $grado)
            ->where('seccion', strtoupper($seccion))
            ->first();

        if (!$aula) {
            $this->command->warn("Aula no encontrada para {$nivel} {$grado}{$seccion}");
            return;
        }

        $gender = $this->normalizeGender($row['SEXO'] ?? null);
        if (!$gender) {
            $this->command->warn("Sexo no reconocido: '{$row['SEXO']}' (usando NULL)");
        }

        Estudiante::updateOrCreate(
            ['document_number' => $dni],
            [
                'name' => trim($row['NOMBRES'] ?? ''),
                'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
                'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
                'document_type' => $row['TIPO DE DOCUMENTO'] ?: 'DNI',
                'student_code' => trim($row['CÓDIGO DEL ESTUDIANTE'] ?? ''),
                'gender' => $gender,
                'date_of_birth' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
                'aula_id' => $aula->id,
                'qr_code' => $this->generateQRCode($dni),
            ]
        );
    }

    private function normalizeGender(?string $value): ?string
    {
        $value = strtolower(trim($value ?? ''));

        return match ($value) {
            'mujer' => 'F',
            'hombre' => 'M',
            default => null,
        };
    }

    private function resolveDocumentNumber(array $row): string
    {
        $dni = trim($row['NÚMERO DE DOCUMENTO'] ?? '');

        if (empty($dni)) {
            $fallback = trim($row['CÓDIGO DEL ESTUDIANTE'] ?? '');
            $dni = substr(preg_replace('/[^A-Za-z0-9]/', '', $fallback), 0, 20);
            $this->command->warn("DNI vacío, usando código del estudiante '{$dni}' como fallback.");
        }

        return $dni;
    }

    private function parseSection(string $value, string $nivel): array
    {
        $value = trim($value);

        if ($nivel === 'INICIAL') {
            if (preg_match('/^([A-ZÁÉÍÓÚÑ]+)_?(\d+)/iu', $value, $matches)) {
                return [$matches[2] ?? null, strtoupper($matches[1] ?? '')];
            }
        }

        if (preg_match('/^(\d+)([A-Z])$/i', $value, $matches)) {
            return [(int) $matches[1], strtoupper($matches[2])];
        }

        $this->command->warn("Sección no reconocida: '{$value}' (nivel {$nivel})");

        return [null, null];
    }

    private function parseDate(?string $value): ?string
    {
        if (!$value) return null;

        try {
            $value = trim($value);
            $date = Carbon::createFromFormat('d/m/Y', $value);
            return $date->format('Y-m-d');
        } catch (\Throwable $e) {
            $this->command->warn("Fecha inválida: '{$value}'");
            return null;
        }
    }

    private function generateQRCode(string $dni): string
    {
        $hash = strtoupper(substr(hash('crc32', $dni), 0, 8));
        return 'RP000' . $hash;
    }
}
