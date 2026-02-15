<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use League\Csv\Reader;
use Carbon\Carbon;

class CsvSeeder extends Seeder
{
    private $tenant;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataPath = database_path('seeders/data');

        if (!is_dir($dataPath)) {
            $this->command->error("Directorio no encontrado: {$dataPath}");
            return;
        }

        $csvFiles = glob($dataPath . '/*.csv');

        if (empty($csvFiles)) {
            $this->command->warn("No se encontraron archivos CSV en {$dataPath}");
            return;
        }

        $this->command->info("========================================");
        $this->command->info("Iniciando CsvSeeder");
        $this->command->info("Archivos encontrados: " . count($csvFiles));
        $this->command->info("========================================");
        $this->command->newLine();

        foreach ($csvFiles as $filePath) {
            $this->processFile($filePath);
            $this->command->newLine();
        }

        $this->command->info("========================================");
        $this->command->info("CsvSeeder completado");
        $this->command->info("========================================");
    }

    private function processFile(string $filePath): void
    {
        $fileName = pathinfo($filePath, PATHINFO_FILENAME);
        $tenantCode = $fileName;

        $this->command->info("Procesando: {$fileName}.csv");
        $this->command->line("Código de tenant: {$tenantCode}");

        $this->tenant = Tenant::where('code', $tenantCode)->first();

        if (!$this->tenant) {
            $this->command->error("  ✗ Tenant con código '{$tenantCode}' no encontrado. Saltando archivo.");
            return;
        }

        $this->command->info("  ✓ Tenant encontrado: {$this->tenant->name}");

        try {
            $csv = Reader::from($filePath);
            $csv->setHeaderOffset(0);
            $records = $csv->getRecords();

            $count = 0;
            $warnings = 0;
            $errors = 0;

            foreach ($records as $index => $row) {
                try {
                    $rol = trim($row['ROL'] ?? '');

                    match (strtolower($rol)) {
                        'docente' => $this->createTeacher($row),
                        'estudiante' => $this->createStudent($row),
                        'apoderado' => $this->command->warn("    Fila #{$index}: Rol 'Apoderado' en proceso, se omite."),
                        default => function () use ($rol, &$warnings, $index) {
                            $this->command->warn("    Fila #{$index}: Rol desconocido '{$rol}'");
                            $warnings++;
                        },
                    };

                    $count++;
                } catch (\Throwable $e) {
                    $errors++;
                    $this->command->error("    Error en fila {$index}: " . $e->getMessage());
                }
            }

            $this->command->info("  Resultados:");
            $this->command->line("    - Registros procesados: {$count}");
            $this->command->line("    - Advertencias: {$warnings}");
            $this->command->line("    - Errores: {$errors}");
        } catch (\Throwable $e) {
            $this->command->error("  ✗ Error al procesar archivo: " . $e->getMessage());
        }
    }

    private function createTeacher(array $row): void
    {
        $dni = $this->resolveDocumentNumber($row);
        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));

        Teacher::updateOrCreate(
            [
                'tenant_id' => $this->tenant->id,
                'dni' => $dni
            ],
            [
                'qr_code' => $this->generateQRCode($dni),
                'name' => trim($row['NOMBRES'] ?? ''),
                'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
                'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
                'birth_date' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
                'gender' => $this->normalizeGender($row['SEXO'] ?? null),
                'level' => $nivel ?: null,
                'area' => trim($row['AREÁ CURRICULAR'] ?? '') ?: null,
                'email' => null,
                'phone_number' => null,
                'status' => 'ACTIVO',
            ]
        );
    }

    private function createStudent(array $row): void
    {
        $dni = $this->resolveDocumentNumber($row);
        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));
        [$grado, $seccion] = $this->parseSection($row['SECCIÓN'] ?? '', $nivel);

        $classroom = Classroom::where('tenant_id', $this->tenant->id)
            ->where('level', $nivel)
            ->where('grade', $grado)
            ->where('section', strtoupper($seccion))
            ->first();

        if (!$classroom) {
            $this->command->warn("Aula no encontrada para {$nivel} {$grado}° '{$seccion}'");
            return;
        }

        $gender = $this->normalizeGender($row['SEXO'] ?? null);
        if (!$gender && !empty($row['SEXO'])) {
            $this->command->warn("Sexo no reconocido: '{$row['SEXO']}' (usando NULL)");
        }

        $studentCode = trim($row['CÓDIGO DEL ESTUDIANTE'] ?? '');

        Student::updateOrCreate(
            [
                'tenant_id' => $this->tenant->id,
                'document_number' => $dni
            ],
            [
                'qr_code' => $this->generateQRCode($dni),
                'student_code' => $studentCode ?: null,
                'name' => trim($row['NOMBRES'] ?? ''),
                'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
                'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
                'document_type' => trim($row['TIPO DE DOCUMENTO'] ?? '') ?: 'DNI',
                'gender' => $gender,
                'birth_date' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
                'classroom_id' => $classroom->id,
                'academic_year' => $this->tenant->currentAcademicYear?->year ?? now()->year,
                'academic_year_id' => $this->tenant->current_academic_year_id,
                'enrollment_status' => 'MATRICULADO',
                'photo_url' => null,
            ]
        );
    }

    private function normalizeGender(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $value = strtolower(trim($value));

        return match ($value) {
            'mujer', 'femenino', 'f' => 'F',
            'hombre', 'masculino', 'm' => 'M',
            default => null,
        };
    }

    private function resolveDocumentNumber(array $row): string
    {
        $dni = trim($row['NÚMERO DE DOCUMENTO'] ?? '');

        if (empty($dni)) {
            $fallback = trim($row['CÓDIGO DEL ESTUDIANTE'] ?? '');
            $dni = substr(preg_replace('/[^A-Za-z0-9]/', '', $fallback), 0, 20);

            if (empty($dni)) {
                $dni = 'TEMP' . time() . rand(1000, 9999);
            }

            $this->command->warn("DNI vacío, usando '{$dni}' como fallback.");
        }

        return $dni;
    }

    private function parseSection(string $value, string $nivel): array
    {
        $value = trim($value);

        if (empty($value)) {
            return [null, null];
        }

        if ($nivel === 'INICIAL') {
            if (preg_match('/^([A-ZÁÉÍÓÚÑ\s]+)_?(\d+)/iu', $value, $matches)) {
                return [(int)($matches[2] ?? null), strtoupper(trim($matches[1] ?? ''))];
            }

            if (preg_match('/^(\d+)_?([A-ZÁÉÍÓÚÑ\s]+)/iu', $value, $matches)) {
                return [(int)($matches[1] ?? null), strtoupper(trim($matches[2] ?? ''))];
            }
        }

        if (preg_match('/^(\d+)\s*([A-Z])\s*$/i', $value, $matches)) {
            return [(int)$matches[1], strtoupper($matches[2])];
        }

        if (preg_match('/^(\d+)\s+([A-Z])\s*$/i', $value, $matches)) {
            return [(int)$matches[1], strtoupper($matches[2])];
        }

        $this->command->warn("Sección no reconocida: '{$value}' (nivel {$nivel})");

        return [null, null];
    }

    private function parseDate(?string $value): ?string
    {
        if (!$value || trim($value) === '') {
            return null;
        }

        try {
            $value = trim($value);

            if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $value)) {
                $date = Carbon::createFromFormat('d/m/Y', $value);
                return $date->format('Y-m-d');
            }

            if (preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $value)) {
                $date = Carbon::createFromFormat('Y-m-d', $value);
                return $date->format('Y-m-d');
            }

            $date = Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Throwable $e) {
            $this->command->warn("Fecha inválida: '{$value}'");
            return null;
        }
    }

    private function generateQRCode(string $dni): string
    {
        $hash = strtoupper(substr(hash('crc32', $dni . $this->tenant->code), 0, 8));
        return $this->tenant->code . $hash;
    }
}
