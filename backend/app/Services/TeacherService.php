<?php

namespace App\Services;

use App\Models\Teacher;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    use LogsActivity;

    /**
     * Get all teachers with optional search and filters
     */
    public function getAllTeachers(?string $search = null, ?string $level = null, ?string $status = null): Collection
    {
        $query = Teacher::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('dni', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('paternal_surname', 'like', "%{$search}%")
                        ->orWhere('maternal_surname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($level, fn($q) => $q->where('level', $level))
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name');

        return $query->get();
    }

    /**
     * Find teacher by ID
     */
    public function findById(int $id): Teacher
    {
        return Teacher::with(['classrooms.students'])
            ->withCount('classrooms')
            ->findOrFail($id);
    }

    /**
     * Create a new teacher
     */
    public function create(array $data): Teacher
    {
        return DB::transaction(function () use ($data) {
            if (!isset($data['qr_code'])) {
                $data['qr_code'] = $this->generateQRCode($data['dni']);
            }

            $data['status'] = $data['status'] ?? 'ACTIVO';

            $teacher = Teacher::create($data);

            $teacher->load(['classrooms']);

            $this->logActivity('teacher_created', $teacher, [
                'dni' => $teacher->dni,
                'full_name' => $teacher->full_name,
            ]);

            return $teacher;
        });
    }

    /**
     * Update an existing teacher
     */
    public function update(int $id, array $data): Teacher
    {
        return DB::transaction(function () use ($id, $data) {
            $teacher = Teacher::findOrFail($id);

            $oldValues = $teacher->only(['dni', 'name', 'level', 'status', 'email']);

            $teacher->update($data);

            $teacher->load(['classrooms']);

            $newValues = $teacher->only(array_keys($oldValues));
            $this->logActivityWithChanges('teacher_updated', $teacher, $oldValues, $newValues);

            return $teacher;
        });
    }

    /**
     * Delete a teacher
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $teacher = Teacher::findOrFail($id);

            if ($teacher->classrooms()->where('status', 'ACTIVO')->exists()) {
                throw new \Exception('No se puede eliminar el docente porque tiene aulas activas asignadas.');
            }

            $this->logActivity('teacher_deleted', $teacher, [
                'dni' => $teacher->dni,
                'full_name' => $teacher->full_name,
            ]);

            $teacher->delete();
        });
    }

    /**
     * Generate QR code for teacher
     */
    private function generateQRCode(string $dni): string
    {
        $hash = strtoupper(substr(hash('crc32', $dni . time()), 0, 8));
        return $hash;
    }
}
