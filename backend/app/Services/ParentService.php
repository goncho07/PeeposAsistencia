<?php

namespace App\Services;

use App\Models\ParentGuardian;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ParentService
{
    use LogsActivity;

    /**
     * Get all parents with optional search.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param string|null $search
     * @param array $expand Relations to expand (students)
     */
    public function getAllParents(?string $search = null, array $expand = []): Collection
    {
        $query = ParentGuardian::query()
            ->withCount('students')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('document_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('paternal_surname', 'like', "%{$search}%")
                        ->orWhere('maternal_surname', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name');

        if (in_array('students', $expand)) {
            $query->with([
                'students:id,student_code,name,paternal_surname,maternal_surname,document_number,enrollment_status,classroom_id',
                'students.classroom:id,level,grade,section'
            ]);
        }

        return $query->get();
    }

    /**
     * Find parent by ID.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): ParentGuardian
    {
        $query = ParentGuardian::query();

        if (in_array('students', $expand)) {
            $query->with(['students.classroom']);
        }

        return $query->findOrFail($id);
    }

    /**
     * Create a new parent
     */
    public function create(array $data): ParentGuardian
    {
        return DB::transaction(function () use ($data) {
            $studentsData = $data['students'] ?? [];
            unset($data['students']);

            $parent = ParentGuardian::create($data);

            if (!empty($studentsData)) {
                $this->syncStudents($parent, $studentsData);
            }

            $parent->load(['students.classroom']);

            $this->logActivity('parent_created', $parent, [
                'document_number' => $parent->document_number,
                'full_name' => $parent->full_name,
            ]);

            return $parent;
        });
    }

    /**
     * Update an existing parent
     */
    public function update(int $id, array $data): ParentGuardian
    {
        return DB::transaction(function () use ($id, $data) {
            $parent = ParentGuardian::findOrFail($id);

            $oldValues = $parent->only(['document_number', 'name', 'phone_number', 'email']);

            $studentsData = $data['students'] ?? null;
            unset($data['students']);

            $parent->update($data);

            if ($studentsData !== null) {
                $this->syncStudents($parent, $studentsData);
            }

            $parent->load(['students.classroom']);

            $newValues = $parent->only(array_keys($oldValues));
            $this->logActivityWithChanges('parent_updated', $parent, $oldValues, $newValues);

            return $parent;
        });
    }

    /**
     * Delete a parent
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $parent = ParentGuardian::findOrFail($id);

            $hasPrimaryContact = $parent->students()
                ->wherePivot('is_primary_contact', true)
                ->exists();

            if ($hasPrimaryContact) {
                throw new \Exception('No se puede eliminar el apoderado porque es el contacto principal de uno o más estudiantes.');
            }

            $this->logActivity('parent_deleted', $parent, [
                'document_number' => $parent->document_number,
                'full_name' => $parent->full_name,
            ]);

            $parent->students()->detach();

            $parent->delete();
        });
    }

    /**
     * Sync students with parent
     */
    private function syncStudents(ParentGuardian $parent, array $studentsData): void
    {
        $syncData = [];

        foreach ($studentsData as $studentData) {
            $syncData[$studentData['student_id']] = [
                'tenant_id' => $parent->tenant_id,
                'relationship_type' => $studentData['relationship_type'],
                'custom_relationship_label' => $studentData['custom_relationship_label'] ?? null,
                'is_primary_contact' => $studentData['is_primary_contact'] ?? false,
                'receives_notifications' => $studentData['receives_notifications'] ?? true,
            ];
        }

        $parent->students()->sync($syncData);
    }
}
