<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Classroom;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StudentService
{
    use LogsActivity;

    /**
     * Get all students with optional search and filters.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param string|null $search
     * @param int|null $classroomId
     * @param array $expand Relations to expand (classroom, parents)
     */
    public function getAllStudents(?string $search = null, ?int $classroomId = null, array $expand = []): Collection
    {
        $query = Student::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('student_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('paternal_surname', 'like', "%{$search}%")
                        ->orWhere('maternal_surname', 'like', "%{$search}%")
                        ->orWhere('document_number', 'like', "%{$search}%");
                });
            })
            ->when($classroomId, fn($q) => $q->where('classroom_id', $classroomId))
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name');

        $relations = $this->buildRelationsFromExpand($expand);
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->get();
    }

    /**
     * Find student by ID.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): Student
    {
        $query = Student::query();
        
        $relations = $this->buildRelationsFromExpand($expand, true);
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->findOrFail($id);
    }

    /**
     * Create a new student
     */
    public function create(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            $this->validateClassroomCapacity($data['classroom_id']);

            if (!isset($data['qr_code'])) {
                $data['qr_code'] = $this->generateQRCode($data['document_number']);
            }

            $data['academic_year'] = $data['academic_year'] ?? now()->year;
            $data['enrollment_status'] = $data['enrollment_status'] ?? 'MATRICULADO';

            $parentsData = $data['parents'] ?? [];
            unset($data['parents']);

            $student = Student::create($data);

            if (!empty($parentsData)) {
                $this->syncParents($student, $parentsData);
            }

            $student->load(['classroom.tutor', 'parents']);

            $this->logActivity('student_created', $student, [
                'student_code' => $student->student_code,
                'full_name' => $student->full_name,
            ]);

            return $student;
        });
    }

    /**
     * Update an existing student
     */
    public function update(int $id, array $data): Student
    {
        return DB::transaction(function () use ($id, $data) {
            $student = Student::findOrFail($id);

            $oldValues = $student->only(['student_code', 'name', 'classroom_id', 'enrollment_status']);

            if (isset($data['classroom_id']) && $data['classroom_id'] != $student->classroom_id) {
                $this->validateClassroomCapacity($data['classroom_id']);
            }

            $parentsData = $data['parents'] ?? null;
            unset($data['parents']);

            $student->update($data);

            if ($parentsData !== null) {
                $this->syncParents($student, $parentsData);
            }

            $student->load(['classroom.tutor', 'parents']);

            $newValues = $student->only(array_keys($oldValues));
            $this->logActivityWithChanges('student_updated', $student, $oldValues, $newValues);

            return $student;
        });
    }

    /**
     * Delete a student
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $student = Student::findOrFail($id);

            $this->logActivity('student_deleted', $student, [
                'student_code' => $student->student_code,
                'full_name' => $student->full_name,
            ]);

            $student->parents()->detach();

            $student->delete();
        });
    }

    /**
     * Build relations array from expand parameter.
     *
     * @param array $expand
     * @param bool $isDetailView If true, may load more relations by default
     */
    private function buildRelationsFromExpand(array $expand, bool $isDetailView = false): array
    {
        $relations = [];

        if (in_array('classroom', $expand)) {
            $relations[] = 'classroom.tutor';
        }

        if (in_array('parents', $expand)) {
            $relations[] = 'parents';
        }

        return $relations;
    }

    /**
     * Sync parents with student
     */
    private function syncParents(Student $student, array $parentsData): void
    {
        $syncData = [];

        foreach ($parentsData as $parentData) {
            $syncData[$parentData['parent_id']] = [
                'tenant_id' => $student->tenant_id,
                'relationship_type' => $parentData['relationship_type'],
                'custom_relationship_label' => $parentData['custom_relationship_label'] ?? null,
                'is_primary_contact' => $parentData['is_primary_contact'] ?? false,
                'receives_notifications' => $parentData['receives_notifications'] ?? true,
            ];
        }

        $student->parents()->sync($syncData);
    }

    /**
     * Validate classroom capacity
     */
    private function validateClassroomCapacity(int $classroomId): void
    {
        $classroom = Classroom::findOrFail($classroomId);

        if ($classroom->status !== 'ACTIVO') {
            throw new \Exception('El aula seleccionada no está activa.');
        }

        if (!$classroom->hasCapacity()) {
            throw new \Exception('El aula seleccionada ya ha alcanzado su capacidad máxima.');
        }
    }

    /**
     * Generate QR code for student
     */
    private function generateQRCode(string $documentNumber): string
    {
        $hash = strtoupper(substr(hash('crc32', $documentNumber . time()), 0, 8));
        return $hash;
    }
}
