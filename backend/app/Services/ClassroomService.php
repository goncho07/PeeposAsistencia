<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Classroom;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ClassroomService
{
    use LogsActivity;

    /**
     * Get all classrooms with optional search and filters.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param string|null $search
     * @param string|null $level
     * @param string|null $shift
     * @param string|null $status
     * @param int|null $tutorId
     * @param int|null $teacherId
     * @param array $expand Relations to expand (tutor, teachers, students)
     */
    public function getAllClassrooms(
        ?string $search = null,
        ?string $level = null,
        ?string $shift = null,
        ?string $status = null,
        ?int $tutorId = null,
        ?int $teacherId = null,
        array $expand = []
    ): Collection {
        $query = Classroom::query()
            ->withCount('students')
            ->when($search, fn($q) => $q->search($search))
            ->when($level, fn($q) => $q->byLevel($level))
            ->when($shift, fn($q) => $q->byShift($shift))
            ->when($status, fn($q) => $q->byStatus($status))
            ->when($tutorId, fn($q) => $q->where('tutor_id', $tutorId))
            ->when($teacherId, fn($q) => $q->byTeacher($teacherId))
            ->orderBy('level')
            ->orderBy('grade')
            ->orderBy('section');

        $relations = $this->buildRelationsFromExpand($expand);
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->get();
    }

    /**
     * Find classroom by ID.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): Classroom
    {
        $query = Classroom::query()->withCount('students');

        $relations = $this->buildRelationsFromExpand($expand);
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->findOrFail($id);
    }

    /**
     * Build relations array from expand parameter.
     */
    private function buildRelationsFromExpand(array $expand): array
    {
        $relations = [];

        if (in_array('tutor', $expand)) {
            $relations[] = 'tutor.user';
        }

        if (in_array('teachers', $expand)) {
            $relations[] = 'teachers';
        }

        if (in_array('students', $expand)) {
            $relations[] = 'students';
        }

        return $relations;
    }

    /**
     * Create a new classroom
     */
    public function create(array $data): Classroom
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = $data['status'] ?? 'ACTIVO';

            if (isset($data['tutor_id'])) {
                $this->validateTutorAssignment($data['tutor_id'], $data['level']);
            }

            $classroom = Classroom::create($data);

            $classroom->load(['tutor.user']);

            $this->logActivity('classroom_created', $classroom, [
                'full_name' => $classroom->full_name,
                'level' => $classroom->level,
                'grade' => $classroom->grade,
                'section' => $classroom->section,
            ]);

            return $classroom;
        });
    }

    /**
     * Update an existing classroom
     */
    public function update(int $id, array $data): Classroom
    {
        return DB::transaction(function () use ($id, $data) {
            $classroom = Classroom::findOrFail($id);

            $oldValues = $classroom->only(['tutor_id', 'level', 'grade', 'section', 'shift', 'status']);

            if (isset($data['tutor_id']) && $data['tutor_id'] != $classroom->tutor_id) {
                $level = $data['level'] ?? $classroom->level;
                $this->validateTutorAssignment($data['tutor_id'], $level);
            }

            $classroom->update($data);

            $classroom->load(['tutor.user', 'teachers']);

            $newValues = $classroom->only(array_keys($oldValues));
            $this->logActivityWithChanges('classroom_updated', $classroom, $oldValues, $newValues);

            return $classroom;
        });
    }

    /**
     * Delete a classroom
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $classroom = Classroom::findOrFail($id);

            $activeStudentsCount = $classroom->students()
                ->where('enrollment_status', 'MATRICULADO')
                ->count();

            if ($activeStudentsCount > 0) {
                throw new BusinessException("No se puede eliminar el aula porque tiene {$activeStudentsCount} estudiante(s) matriculado(s).");
            }

            $this->logActivity('classroom_deleted', $classroom, [
                'full_name' => $classroom->full_name,
                'level' => $classroom->level,
                'grade' => $classroom->grade,
                'section' => $classroom->section,
            ]);

            $classroom->delete();
        });
    }

    /**
     * Validate tutor assignment to classroom
     */
    private function validateTutorAssignment(?int $tutorId, string $level): void
    {
        if (!$tutorId) {
            return;
        }

        $teacher = \App\Models\Teacher::findOrFail($tutorId);

        if ($teacher->level !== $level) {
            throw new BusinessException(
                "El tutor está asignado al nivel {$teacher->level} y no puede ser asignado a un aula de nivel {$level}."
            );
        }

        if ($teacher->isInactive()) {
            throw new BusinessException('El tutor no está activo y no puede ser asignado a un aula.');
        }
    }

    /**
     * Bulk create classrooms.
     *
     * @param array $data Contains: level, grades[], sections (string), shift?, capacity?
     * @return array ['created' => int, 'skipped' => int]
     */
    public function bulkCreate(array $data): array
    {
        $sections = array_map('trim', str_split(strtoupper($data['sections'])));
        $created = 0;
        $skipped = 0;

        foreach ($data['grades'] as $grade) {
            foreach ($sections as $section) {
                if (empty($section)) {
                    continue;
                }

                $exists = Classroom::where('level', $data['level'])
                    ->where('grade', $grade)
                    ->where('section', $section)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                Classroom::create([
                    'level' => $data['level'],
                    'grade' => $grade,
                    'section' => $section,
                    'shift' => $data['shift'] ?? 'MAÑANA',
                    'capacity' => $data['capacity'] ?? 30,
                    'status' => 'ACTIVO',
                ]);
                $created++;
            }
        }

        return compact('created', 'skipped');
    }
}
