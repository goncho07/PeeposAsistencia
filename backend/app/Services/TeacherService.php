<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Teacher;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherService
{
    use LogsActivity;

    public function __construct(
        protected QRCodeService $qrCodeService
    ) {}

    /**
     * Get all teachers with optional search and filters.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param string|null $search
     * @param string|null $level
     * @param string|null $status
     * @param array $expand Relations to expand (user, classrooms, tutoredClassrooms)
     */
    public function getAllTeachers(?string $search = null, ?string $level = null, ?string $status = null, array $expand = []): Collection
    {
        $query = Teacher::query()
            ->when($search, fn($q) => $q->search($search))
            ->when($level, fn($q) => $q->byLevel($level))
            ->when($status, fn($q) => $q->byStatus($status))
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->orderBy('users.paternal_surname')
            ->orderBy('users.maternal_surname')
            ->orderBy('users.name')
            ->select('teachers.*');

        $relations = $this->buildRelationsFromExpand($expand);
        $query->with($relations);

        return $query->get();
    }

    /**
     * Find teacher by ID.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): Teacher
    {
        $relations = $this->buildRelationsFromExpand($expand);

        return Teacher::with($relations)->findOrFail($id);
    }

    /**
     * Build relations array from expand parameter.
     */
    private function buildRelationsFromExpand(array $expand): array
    {
        $relations = ['user'];

        if (in_array('classrooms', $expand)) {
            $relations[] = 'classrooms';
        }
        if (in_array('tutoredClassrooms', $expand)) {
            $relations[] = 'tutoredClassrooms';
        }

        return $relations;
    }

    /**
     * Create a new teacher with their user account.
     *
     * Expected data structure:
     * - Personal data (for User): document_type, document_number, name, paternal_surname,
     *   maternal_surname, email, phone_number, photo_url
     * - Teacher data: level, specialty, contract_type, hire_date, status
     */
    public function create(array $data): Teacher
    {
        return DB::transaction(function () use ($data) {
            $userData = [
                'document_type' => $data['document_type'] ?? 'DNI',
                'document_number' => $data['document_number'],
                'name' => $data['name'],
                'paternal_surname' => $data['paternal_surname'],
                'maternal_surname' => $data['maternal_surname'],
                'email' => $data['email'],
                'phone_number' => $data['phone_number'] ?? null,
                'photo_url' => $data['photo_url'] ?? null,
                'password' => Hash::make($data['password'] ?? $this->generateDefaultPassword($data['document_number'])),
                'role' => 'DOCENTE',
                'status' => 'ACTIVO',
            ];

            $user = User::create($userData);
   
            $teacherData = [
                'user_id' => $user->id,
                'qr_code' => $data['qr_code'] ?? $this->qrCodeService->generate($data['document_number']),
                'level' => $data['level'],
                'specialty' => $data['specialty'] ?? null,
                'contract_type' => $data['contract_type'] ?? 'CONTRATADO',
                'hire_date' => $data['hire_date'] ?? null,
                'status' => $data['status'] ?? 'ACTIVO',
            ];

            $teacher = Teacher::create($teacherData);

            $teacher->load(['user', 'classrooms']);

            $this->logActivity('teacher_created', $teacher, [
                'document_number' => $user->document_number,
                'full_name' => $user->full_name,
            ]);

            return $teacher;
        });
    }

    /**
     * Update an existing teacher and their user account.
     */
    public function update(int $id, array $data): Teacher
    {
        return DB::transaction(function () use ($id, $data) {
            $teacher = Teacher::with('user')->findOrFail($id);
            $user = $teacher->user;

            $oldValues = [
                'document_number' => $user->document_number,
                'name' => $user->name,
                'email' => $user->email,
                'level' => $teacher->level,
                'specialty' => $teacher->specialty,
                'status' => $teacher->status,
            ];

            $userFields = ['document_type', 'document_number', 'name', 'paternal_surname',
                           'maternal_surname', 'email', 'phone_number', 'photo_url'];
            $userUpdate = array_intersect_key($data, array_flip($userFields));

            if (!empty($userUpdate)) {
                $user->update($userUpdate);
            }

            if (!empty($data['password'])) {
                $user->update(['password' => Hash::make($data['password'])]);
            }

            $teacherFields = ['level', 'specialty', 'contract_type', 'hire_date', 'status', 'qr_code'];
            $teacherUpdate = array_intersect_key($data, array_flip($teacherFields));

            if (!empty($teacherUpdate)) {
                $teacher->update($teacherUpdate);
            }

            $teacher->load(['user', 'classrooms']);

            $newValues = [
                'document_number' => $user->document_number,
                'name' => $user->name,
                'email' => $user->email,
                'level' => $teacher->level,
                'specialty' => $teacher->specialty,
                'status' => $teacher->status,
            ];

            $this->logActivityWithChanges('teacher_updated', $teacher, $oldValues, $newValues);

            return $teacher;
        });
    }

    /**
     * Delete a teacher and optionally their user account.
     */
    public function delete(int $id, bool $deleteUser = false): void
    {
        DB::transaction(function () use ($id, $deleteUser) {
            $teacher = Teacher::with('user')->findOrFail($id);

            if ($teacher->tutoredClassrooms()->active()->exists()) {
                throw new BusinessException('No se puede eliminar el docente porque es tutor de aulas activas.');
            }

            if ($teacher->classrooms()->exists()) {
                throw new BusinessException('No se puede eliminar el docente porque tiene aulas asignadas para enseñar.');
            }

            $this->logActivity('teacher_deleted', $teacher, [
                'document_number' => $teacher->document_number,
                'full_name' => $teacher->full_name,
            ]);

            $user = $teacher->user;

            $teacher->delete();

            if ($deleteUser && $user) {
                $user->update(['status' => 'INACTIVO']);
                $user->delete();
            }
        });
    }

    /**
     * Generate default password from document number.
     */
    private function generateDefaultPassword(string $documentNumber): string
    {
        return $documentNumber;
    }
}
