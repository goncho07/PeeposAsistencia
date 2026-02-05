<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Classroom;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;
use Carbon\Carbon;

class ImportService
{
    public function __construct(
        protected QRCodeService $qrCodeService
    ) {}

    /**
     * Validate CSV file and return validation results.
     *
     * @param string $filePath Path to the CSV file
     * @param string $type Import type (students, teachers, classrooms)
     * @return array Validation results with headers, counts, warnings, errors, and preview
     */
    public function validateFile(string $filePath, string $type): array
    {
        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);
        $headers = $csv->getHeader();
        $records = iterator_to_array($csv->getRecords());

        $validation = $this->validateRecords($records, $type, $headers);

        return [
            'success' => true,
            'headers' => $headers,
            'total_rows' => count($records),
            'valid_rows' => $validation['valid_count'],
            'warnings' => $validation['warnings'],
            'errors' => $validation['errors'],
            'preview' => array_slice($records, 0, 5),
            'can_import' => $validation['valid_count'] > 0,
        ];
    }

    /**
     * Execute the import process.
     *
     * @param string $filePath Path to the CSV file
     * @param string $type Import type (students, teachers, classrooms)
     * @return array Import results with counts and errors
     */
    public function executeImport(string $filePath, string $type): array
    {
        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);
        $records = iterator_to_array($csv->getRecords());

        return DB::transaction(function () use ($records, $type) {
            return match ($type) {
                'students' => $this->importStudents($records),
                'teachers' => $this->importTeachers($records),
                'classrooms' => $this->importClassrooms($records),
            };
        });
    }

    /**
     * Validate records against required headers and data rules.
     */
    private function validateRecords(array $records, string $type, array $headers): array
    {
        $requiredHeaders = $this->getRequiredHeaders($type);

        $warnings = [];
        $errors = [];
        $validCount = 0;

        $missingHeaders = array_diff($requiredHeaders, $headers);
        if (!empty($missingHeaders)) {
            $errors[] = [
                'row' => 0,
                'message' => 'Faltan columnas requeridas: ' . implode(', ', $missingHeaders),
            ];
            return ['valid_count' => 0, 'warnings' => $warnings, 'errors' => $errors];
        }

        foreach ($records as $index => $row) {
            $rowNum = $index + 2;
            $hasError = false;

            foreach ($requiredHeaders as $header) {
                if (empty(trim($row[$header] ?? ''))) {
                    $errors[] = ['row' => $rowNum, 'message' => "Campo '{$header}' vacío"];
                    $hasError = true;
                    break;
                }
            }

            if ($type === 'students' && !$hasError) {
                $warning = $this->validateStudentRow($row, $rowNum);
                if ($warning) {
                    $warnings[] = $warning;
                }
            }

            if (!$hasError) {
                $validCount++;
            }
        }

        return ['valid_count' => $validCount, 'warnings' => $warnings, 'errors' => $errors];
    }

    /**
     * Get required headers for a specific import type.
     */
    private function getRequiredHeaders(string $type): array
    {
        return match ($type) {
            'students' => ['NOMBRES', 'APELLIDO PATERNO', 'NÚMERO DE DOCUMENTO', 'ETAPA', 'SECCIÓN'],
            'teachers' => ['NOMBRES', 'APELLIDO PATERNO', 'NÚMERO DE DOCUMENTO'],
            'classrooms' => ['NIVEL', 'GRADO', 'SECCION'],
        };
    }

    /**
     * Validate a student row and check if classroom exists.
     */
    private function validateStudentRow(array $row, int $rowNum): ?array
    {
        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));
        $seccion = trim($row['SECCIÓN'] ?? '');

        if (empty($nivel) || empty($seccion)) {
            return null;
        }

        [$grado, $sec] = $this->parseSection($seccion, $nivel);

        $classroom = Classroom::where('level', $nivel)
            ->where('grade', $grado)
            ->where('section', strtoupper($sec))
            ->first();

        if (!$classroom) {
            return ['row' => $rowNum, 'message' => "Aula no encontrada: {$nivel} {$grado}° {$sec}"];
        }

        return null;
    }

    /**
     * Import students from records.
     */
    private function importStudents(array $records): array
    {
        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($records as $index => $row) {
            try {
                $result = $this->processStudentRow($row);

                match ($result) {
                    'imported' => $imported++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };
            } catch (\Exception $e) {
                $errors[] = ['row' => $index + 2, 'message' => $e->getMessage()];
            }
        }

        return compact('imported', 'updated', 'skipped', 'errors');
    }

    /**
     * Process a single student row.
     */
    private function processStudentRow(array $row): string
    {
        $dni = $this->resolveDocumentNumber($row);
        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));
        [$grado, $seccion] = $this->parseSection($row['SECCIÓN'] ?? '', $nivel);

        $classroom = Classroom::where('level', $nivel)
            ->where('grade', $grado)
            ->where('section', strtoupper($seccion))
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
            'document_type' => trim($row['TIPO DE DOCUMENTO'] ?? '') ?: 'DNI',
            'gender' => $this->normalizeGender($row['SEXO'] ?? null),
            'birth_date' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
            'classroom_id' => $classroom->id,
            'academic_year' => now()->year,
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
     * Import teachers from records.
     */
    private function importTeachers(array $records): array
    {
        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($records as $index => $row) {
            try {
                $result = $this->processTeacherRow($row);

                match ($result) {
                    'imported' => $imported++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };
            } catch (\Exception $e) {
                $errors[] = ['row' => $index + 2, 'message' => $e->getMessage()];
            }
        }

        return compact('imported', 'updated', 'skipped', 'errors');
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

        $nivel = strtoupper(trim($row['ETAPA'] ?? ''));

        $data = [
            'qr_code' => $this->qrCodeService->generate($dni),
            'name' => trim($row['NOMBRES'] ?? ''),
            'paternal_surname' => trim($row['APELLIDO PATERNO'] ?? ''),
            'maternal_surname' => trim($row['APELLIDO MATERNO'] ?? ''),
            'birth_date' => $this->parseDate($row['FECHA DE NACIMIENTO'] ?? null),
            'gender' => $this->normalizeGender($row['SEXO'] ?? null),
            'level' => $nivel ?: null,
            'area' => trim($row['AREÁ CURRICULAR'] ?? '') ?: null,
            'status' => 'ACTIVO',
        ];

        $teacher = Teacher::where('dni', $dni)->first();

        if ($teacher) {
            $teacher->update($data);
            return 'updated';
        }

        Teacher::create(array_merge($data, [
            'dni' => $dni,
        ]));

        return 'imported';
    }

    /**
     * Import classrooms from records.
     */
    private function importClassrooms(array $records): array
    {
        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];

        foreach ($records as $index => $row) {
            try {
                $result = $this->processClassroomRow($row);

                match ($result) {
                    'imported' => $imported++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };
            } catch (\Exception $e) {
                $errors[] = ['row' => $index + 2, 'message' => $e->getMessage()];
            }
        }

        return compact('imported', 'updated', 'skipped', 'errors');
    }

    /**
     * Process a single classroom row.
     */
    private function processClassroomRow(array $row): string
    {
        $level = strtoupper(trim($row['NIVEL'] ?? ''));
        $grade = trim($row['GRADO'] ?? '');
        $section = strtoupper(trim($row['SECCION'] ?? ''));

        if (empty($level) || empty($grade) || empty($section)) {
            return 'skipped';
        }

        $data = [
            'capacity' => (int) ($row['CAPACIDAD'] ?? 30),
        ];

        $classroom = Classroom::where('level', $level)
            ->where('grade', $grade)
            ->where('section', $section)
            ->first();

        if ($classroom) {
            $classroom->update($data);
            return 'updated';
        }

        Classroom::create(array_merge($data, [
            'level' => $level,
            'grade' => $grade,
            'section' => $section,
        ]));

        return 'imported';
    }

    /**
     * Normalize gender value to M/F.
     */
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
     */
    private function parseSection(string $value, string $nivel): array
    {
        $value = trim($value);

        if (empty($value)) {
            return [null, null];
        }

        if ($nivel === 'INICIAL') {
            if (preg_match('/^([A-ZÁÉÍÓÚÑ\s]+)_?(\d+)/iu', $value, $matches)) {
                return [(int) ($matches[2] ?? null), strtoupper(trim($matches[1] ?? ''))];
            }
            if (preg_match('/^(\d+)_?([A-ZÁÉÍÓÚÑ\s]+)/iu', $value, $matches)) {
                return [(int) ($matches[1] ?? null), strtoupper(trim($matches[2] ?? ''))];
            }
        }

        if (preg_match('/^(\d+)\s*([A-Z])\s*$/i', $value, $matches)) {
            return [(int) $matches[1], strtoupper($matches[2])];
        }

        return [null, null];
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
