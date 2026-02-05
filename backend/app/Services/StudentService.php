<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Student;
use App\Models\Classroom;
use App\Services\Biometric\FaceEnrollmentService;
use App\Traits\LogsActivity;
use App\Traits\HasPhotoUpload;
use App\Traits\SyncsPivotRelations;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StudentService
{
    use LogsActivity, HasPhotoUpload, SyncsPivotRelations;

    public function __construct(
        protected FaceEnrollmentService $faceEnrollmentService,
        protected QRCodeService $qrCodeService
    ) {}

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
            ->when($search, fn($q) => $q->search($search))
            ->when($classroomId, fn($q) => $q->byClassroom($classroomId))
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
                $data['qr_code'] = $this->qrCodeService->generate($data['document_number']);
            }

            $data['academic_year'] = $data['academic_year'] ?? now()->year;
            $data['enrollment_status'] = $data['enrollment_status'] ?? 'MATRICULADO';

            if (isset($data['photo'])) {
                $data['photo_url'] = $this->uploadPhoto($data['photo'], 'students');
                unset($data['photo']);
            }

            $parentsData = $data['parents'] ?? [];
            unset($data['parents']);

            $student = Student::create($data);

            if (!empty($parentsData)) {
                $this->syncParentsRelation($student, $parentsData);
            }

            if ($student->photo_url && config('biometric.enabled')) {
                $this->faceEnrollmentService->enrollStudent($student);
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
            $oldPhotoUrl = $student->photo_url;

            if (isset($data['classroom_id']) && $data['classroom_id'] != $student->classroom_id) {
                $this->validateClassroomCapacity($data['classroom_id']);
            }

            $photoChanged = false;
            if (isset($data['photo'])) {
                $data['photo_url'] = $this->uploadPhoto($data['photo'], 'students', $oldPhotoUrl);
                $photoChanged = true;
                unset($data['photo']);
            }

            $parentsData = $data['parents'] ?? null;
            unset($data['parents']);

            $student->update($data);

            if ($parentsData !== null) {
                $this->syncParentsRelation($student, $parentsData);
            }

            if ($photoChanged && $student->photo_url && config('biometric.enabled')) {
                $this->faceEnrollmentService->enrollStudent($student);
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

            if ($student->photo_url) {
                $this->deletePhoto($student->photo_url);
            }

            if ($student->faceEmbedding && config('biometric.enabled')) {
                $this->faceEnrollmentService->delete($student->faceEmbedding);
            }

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
     * Validate classroom capacity
     */
    private function validateClassroomCapacity(int $classroomId): void
    {
        $classroom = Classroom::findOrFail($classroomId);

        if ($classroom->isInactive()) {
            throw new BusinessException('El aula seleccionada no está activa.');
        }

        if (!$classroom->hasCapacity()) {
            throw new BusinessException('El aula seleccionada ya ha alcanzado su capacidad máxima.');
        }
    }

}
