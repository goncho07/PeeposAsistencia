<?php

namespace App\Services;

use App\Models\Classroom;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ClassroomService
{
    use LogsActivity;

    /**
     * Get all classrooms with optional search and filters
     */
    public function getAllClassrooms(
        ?string $search = null,
        ?string $level = null,
        ?string $shift = null,
        ?string $status = null
    ): Collection {
        $query = Classroom::with(['teacher:id,name,paternal_surname,maternal_surname'])
            ->withCount('students')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('section', 'like', "%{$search}%")
                        ->orWhereHas('teacher', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('paternal_surname', 'like', "%{$search}%")
                                ->orWhere('maternal_surname', 'like', "%{$search}%");
                        });
                });
            })
            ->when($level, fn($q) => $q->where('level', $level))
            ->when($shift, fn($q) => $q->where('shift', $shift))
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('level')
            ->orderBy('grade')
            ->orderBy('section');

        return $query->get();
    }

    /**
     * Find classroom by ID
     */
    public function findById(int $id): Classroom
    {
        return Classroom::with(['teacher', 'students'])
            ->withCount('students')
            ->findOrFail($id);
    }

    /**
     * Create a new classroom
     */
    public function create(array $data): Classroom
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = $data['status'] ?? 'ACTIVO';

            if (isset($data['teacher_id'])) {
                $this->validateTeacherAssignment($data['teacher_id'], $data['level']);
            }

            $classroom = Classroom::create($data);

            $classroom->load(['teacher']);

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

            $oldValues = $classroom->only(['teacher_id', 'level', 'grade', 'section', 'shift', 'status']);

            if (isset($data['teacher_id']) && $data['teacher_id'] != $classroom->teacher_id) {
                $level = $data['level'] ?? $classroom->level;
                $this->validateTeacherAssignment($data['teacher_id'], $level);
            }

            $classroom->update($data);

            $classroom->load(['teacher']);

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
                throw new \Exception("No se puede eliminar el aula porque tiene {$activeStudentsCount} estudiante(s) matriculado(s).");
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
     * Validate teacher assignment to classroom
     */
    private function validateTeacherAssignment(?int $teacherId, string $level): void
    {
        if (!$teacherId) {
            return;
        }

        $teacher = \App\Models\Teacher::findOrFail($teacherId);

        if ($teacher->level !== $level) {
            throw new \Exception(
                "El docente está asignado al nivel {$teacher->level} y no puede ser asignado a un aula de nivel {$level}."
            );
        }
        
        if ($teacher->status !== 'ACTIVO') {
            throw new \Exception('El docente no está activo y no puede ser asignado a un aula.');
        }
    }

    /**
     * Get classrooms by level
     */
    public function getByLevel(string $level): Collection
    {
        return Classroom::with(['teacher'])
            ->withCount('students')
            ->where('level', $level)
            ->where('status', 'ACTIVO')
            ->orderBy('grade')
            ->orderBy('section')
            ->get();
    }

    /**
     * Get classrooms by teacher
     */
    public function getByTeacher(int $teacherId): Collection
    {
        return Classroom::with(['teacher'])
            ->withCount('students')
            ->where('teacher_id', $teacherId)
            ->where('status', 'ACTIVO')
            ->orderBy('level')
            ->orderBy('grade')
            ->orderBy('section')
            ->get();
    }
}
