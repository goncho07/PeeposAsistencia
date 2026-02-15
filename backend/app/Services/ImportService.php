<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use League\Csv\Reader;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ImportService
{
    use LogsActivity;

    private const REQUIRED_HEADERS = [
        'ROL',
        'ETAPA',
        'SECCIÓN',
        'APELLIDO PATERNO',
        'NOMBRES',
    ];

    public function __construct(
        protected QRCodeService $qrCodeService,
        protected AcademicYearService $academicYearService
    ) {}

    /**
     * Validate CSV file and return validation results.
     */
    public function validateFile(string $filePath): array
    {
        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);
        $headers = $csv->getHeader();
        $records = iterator_to_array($csv->getRecords());

        $validation = $this->validateRecords($records, $headers);

        return [
            'success' => true,
            'headers' => $headers,
            'total_rows' => count($records),
            'students_count' => $validation['students_count'],
            'teachers_count' => $validation['teachers_count'],
            'valid_rows' => $validation['valid_count'],
            'warnings' => $validation['warnings'],
            'errors' => $validation['errors'],
            'preview' => array_slice($records, 0, 10),
            'can_import' => $validation['valid_count'] > 0 && empty($validation['errors']),
        ];
    }

    /**
     * Execute the import process in batches.
     */
    public function executeBatch(string $filePath, int $offset, int $batchSize): array
    {
        $currentTenantId = Auth::user()?->tenant_id;

        if (!$currentTenantId) {
            throw new \Exception("Contexto de institución no definido. Seleccione una institución primero.");
        }

        app()->instance('current_tenant_id', (int) $currentTenantId);

        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);
        $records = iterator_to_array($csv->getRecords());
        $total = count($records);

        $batch = array_slice($records, $offset, $batchSize, true);

        $results = DB::transaction(function () use ($batch) {
            $results = [
                'students' => ['imported' => 0, 'updated' => 0, 'skipped' => 0],
                'teachers' => ['imported' => 0, 'updated' => 0, 'skipped' => 0],
                'errors' => [],
            ];

            foreach ($batch as $index => $row) {
                $rowNum = $index + 2;
                $rol = $this->normalizeRol($row['ROL'] ?? '');

                try {
                    if ($rol === 'ESTUDIANTE') {
                        $result = $this->processStudentRow($row);
                        $results['students'][$result]++;
                    } elseif ($rol === 'DOCENTE') {
                        $result = $this->processTeacherRow($row);
                        $results['teachers'][$result]++;
                    }
                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'row' => $rowNum,
                        'message' => $e->getMessage(),
                    ];
                }
            }

            return $results;
        });

        $hasMore = ($offset + $batchSize) < $total;

        if (!$hasMore) {
            $this->logActivity('import_completed', null, [
                'batch_mode' => true,
                'total_records' => $total,
            ]);
        }

        return array_merge($results, [
            'total' => $total,
            'processed_offset' => $offset,
            'processed_count' => count($batch),
            'has_more' => $hasMore,
        ]);
    }

    /**
     * Validate records against required headers and data rules.
     */
    private function validateRecords(array $records, array $headers): array
    {
        $warnings = [];
        $errors = [];
        $validCount = 0;
        $studentsCount = 0;
        $teachersCount = 0;

        $missingHeaders = array_diff(self::REQUIRED_HEADERS, $headers);
        if (!empty($missingHeaders)) {
            $errors[] = [
                'row' => 0,
                'message' => 'Faltan columnas requeridas: ' . implode(', ', $missingHeaders),
            ];
            return [
                'valid_count' => 0,
                'students_count' => 0,
                'teachers_count' => 0,
                'warnings' => $warnings,
                'errors' => $errors,
            ];
        }

        foreach ($records as $index => $row) {
            $rowNum = $index + 2;
            $hasError = false;
            $rol = $this->normalizeRol($row['ROL'] ?? '');

            if (!in_array($rol, ['ESTUDIANTE', 'DOCENTE'])) {
                $errors[] = ['row' => $rowNum, 'message' => "ROL inválido: '{$row['ROL']}'. Debe ser 'Estudiante' o 'Docente'"];
                $hasError = true;
            }

            $requiredFields = ['APELLIDO PATERNO', 'NOMBRES'];
            foreach ($requiredFields as $field) {
                if (empty(trim($row[$field] ?? ''))) {
                    $errors[] = ['row' => $rowNum, 'message' => "Campo '{$field}' vacío"];
                    $hasError = true;
                    break;
                }
            }

            $dni = trim($row['NÚMERO DE DOCUMENTO'] ?? '');
            if ($rol === 'DOCENTE' && empty($dni)) {
                $errors[] = ['row' => $rowNum, 'message' => "NÚMERO DE DOCUMENTO requerido para docentes"];
                $hasError = true;
            }

            if ($rol === 'ESTUDIANTE' && !$hasError) {
                $warning = $this->validateStudentClassroom($row, $rowNum);
                if ($warning) {
                    $warnings[] = $warning;
                }
            }

            if (!$hasError) {
                $validCount++;
                if ($rol === 'ESTUDIANTE') {
                    $studentsCount++;
                } elseif ($rol === 'DOCENTE') {
                    $teachersCount++;
                }
            }
        }

        return [
            'valid_count' => $validCount,
            'students_count' => $studentsCount,
            'teachers_count' => $teachersCount,
            'warnings' => $warnings,
            'errors' => $errors,
        ];
    }

    /**
     * Validate that classroom exists for a student row.
     */
    private function validateStudentClassroom(array $row, int $rowNum): ?array
    {
        $nivel = $this->normalizeLevel($row['ETAPA'] ?? '');
        $seccion = trim($row['SECCIÓN'] ?? '');

        if (empty($nivel) || empty($seccion)) {
            return ['row' => $rowNum, 'message' => "ETAPA o SECCIÓN vacía"];
        }

        $parsed = $this->parseSection($seccion, $nivel);
        if (!$parsed['grade'] || !$parsed['section']) {
            return ['row' => $rowNum, 'message' => "No se pudo interpretar la sección: '{$seccion}'"];
        }

        $classroom = Classroom::where('level', $nivel)
            ->where('grade', $parsed['grade'])
            ->where('section', $parsed['section'])
            ->first();

        if (!$classroom) {
            return [
                'row' => $rowNum,
                'message' => "Aula no encontrada: {$nivel} {$parsed['grade']}° '{$parsed['section']}'",
            ];
        }

        return null;
    }

    /**
     * Process a single student row.
     */
    private function processStudentRow(array $row): string
    {
        $dni = $this->resolveDocumentNumber($row);
        $nivel = $this->normalizeLevel($row['ETAPA'] ?? '');
        $parsed = $this->parseSection($row['SECCIÓN'] ?? '', $nivel);

        $classroom = Classroom::where('level', $nivel)
            ->where('grade', $parsed['grade'])
            ->where('section', $parsed['section'])
            ->first();

        if (!$classroom) {
            return 'skipped';
        }

        $data = [
            'qr_code' => $this->qrCodeService->generate($dni),
            'student_code' => trim($row['CÓDIGO DEL ESTUDIANTE'] ?? '') ?: null,
            'name' => trim($row['NOMBRES'] ?? ''),
            'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
            'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
            'document_type' => $this->normalizeDocumentType($row['TIPO DE DOCUMENTO'] ?? ''),
            'gender' => $this->normalizeGender($row['SEXO'] ?? null),
            'birth_date' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
            'classroom_id' => $classroom->id,
            'academic_year' => $this->academicYearService->getCurrentYearNumber(),
            'academic_year_id' => $this->academicYearService->getCurrentYear()->id,
            'enrollment_status' => 'MATRICULADO',
        ];

        $student = Student::where('document_number', $dni)->first();

        if ($student) {
            $student->update($data);
            return 'updated';
        }

        Student::create(array_merge($data, [
            'document_number' => $dni,
        ]));

        return 'imported';
    }

    /**
     * Process a single teacher row.
     */
    private function processTeacherRow(array $row): string
    {
        $dni = trim($row['NÚMERO DE DOCUMENTO'] ?? '');

        if (empty($dni)) {
            return 'skipped';
        }

        $nivel = $this->normalizeLevel($row['ETAPA'] ?? '');

        $existingTeacher = Teacher::whereHas('user', function ($q) use ($dni) {
            $q->where('document_number', $dni);
        })->first();

        $userData = [
            'name' => trim($row['NOMBRES'] ?? ''),
            'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
            'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
            'document_type' => $this->normalizeDocumentType($row['TIPO DE DOCUMENTO'] ?? ''),
        ];

        $teacherData = [
            'qr_code' => $this->qrCodeService->generate($dni),
            'level' => $nivel ?: null,
            'specialty' => trim($row['AREÁ CURRICULAR'] ?? '') ?: null,
        ];

        if ($existingTeacher) {
            $existingTeacher->user->update($userData);
            $existingTeacher->update($teacherData);
            return 'updated';
        }

        $user = User::create(array_merge($userData, [
            'document_number' => $dni,
            'email' => $dni . '@import.local',
            'password' => Hash::make($dni),
            'role' => 'DOCENTE',
            'status' => 'ACTIVO',
        ]));

        Teacher::create(array_merge($teacherData, [
            'user_id' => $user->id,
        ]));

        return 'imported';
    }

    /**
     * Normalize ROL value.
     */
    private function normalizeRol(string $value): string
    {
        $value = mb_strtoupper(trim($value));

        return match ($value) {
            'ESTUDIANTE', 'ALUMNO', 'STUDENT' => 'ESTUDIANTE',
            'DOCENTE', 'PROFESOR', 'TEACHER' => 'DOCENTE',
            default => $value,
        };
    }

    /**
     * Normalize level (ETAPA) value.
     */
    private function normalizeLevel(string $value): string
    {
        $value = mb_strtoupper(trim($value));

        return match ($value) {
            'INICIAL', 'KINDERGARTEN', 'PREESCOLAR' => 'INICIAL',
            'PRIMARIA', 'PRIMARY', 'ELEMENTARY' => 'PRIMARIA',
            'SECUNDARIA', 'SECONDARY', 'HIGH SCHOOL' => 'SECUNDARIA',
            default => $value,
        };
    }

    /**
     * Normalize document type.
     */
    private function normalizeDocumentType(string $value): string
    {
        $value = mb_strtoupper(trim($value));

        return match ($value) {
            'DNI', 'CE', 'PAS', 'CI', 'PTP' => $value,
            'CARNET DE EXTRANJERIA', 'CARNÉ DE EXTRANJERÍA' => 'CE',
            'PASAPORTE' => 'PAS',
            default => 'DNI',
        };
    }

    /**
     * Normalize gender value to M/F.
     */
    private function normalizeGender(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $value = mb_strtolower(trim($value));

        return match ($value) {
            'mujer', 'femenino', 'f', 'female' => 'F',
            'hombre', 'masculino', 'm', 'male' => 'M',
            default => null,
        };
    }

    /**
     * Resolve document number from row, with fallback to student code.
     */
    private function resolveDocumentNumber(array $row): string
    {
        $dni = trim($row['NÚMERO DE DOCUMENTO'] ?? '');

        if (empty($dni)) {
            $fallback = trim($row['CÓDIGO DEL ESTUDIANTE'] ?? '');
            $dni = substr(preg_replace('/[^A-Za-z0-9]/', '', $fallback), 0, 20);

            if (empty($dni)) {
                $dni = 'TEMP' . time() . rand(1000, 9999);
            }
        }

        return $dni;
    }

    /**
     * Parse section string into grade and section components.
     *
     * Formats supported:
     * - INICIAL: "MARGARITAS_3AÑOS" → grade=3, section="MARGARITAS"
     * - PRIMARIA/SECUNDARIA: "1A" → grade=1, section="A"
     */
    private function parseSection(string $value, string $nivel): array
    {
        $value = trim($value);

        if (empty($value)) {
            return ['grade' => null, 'section' => null];
        }

        if ($nivel === 'INICIAL') {
            if (preg_match('/^([A-ZÁÉÍÓÚÑ]+)[_\s]*(\d+)\s*(?:AÑOS?)?$/iu', $value, $matches)) {
                return [
                    'grade' => (int) $matches[2],
                    'section' => mb_strtoupper($matches[1]),
                ];
            }
            if (preg_match('/^(\d+)\s*(?:AÑOS?)?[_\s]*([A-ZÁÉÍÓÚÑ]+)$/iu', $value, $matches)) {
                return [
                    'grade' => (int) $matches[1],
                    'section' => mb_strtoupper($matches[2]),
                ];
            }
        }

        if (preg_match('/^(\d+)\s*([A-Z])$/i', $value, $matches)) {
            return [
                'grade' => (int) $matches[1],
                'section' => strtoupper($matches[2]),
            ];
        }

        return ['grade' => null, 'section' => null];
    }

    /**
     * Parse date string to Y-m-d format.
     */
    private function parseDate(?string $value): ?string
    {
        if (!$value || trim($value) === '') {
            return null;
        }

        try {
            $value = trim($value);

            if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $value)) {
                return Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
            }

            if (preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $value)) {
                return Carbon::createFromFormat('Y-m-d', $value)->format('Y-m-d');
            }

            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }
}
