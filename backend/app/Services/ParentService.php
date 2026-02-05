<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\ParentGuardian;
use App\Traits\LogsActivity;
use App\Traits\SyncsPivotRelations;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ParentService
{
    use LogsActivity, SyncsPivotRelations;

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
            ->when($search, fn($q) => $q->search($search))
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
     * Find parent by ID.
     * Relations are loaded based on ?expand= parameter.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): ParentGuardian
    {
        $query = ParentGuardian::query();

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

        if (in_array('students', $expand)) {
            $relations[] = 'students.classroom';
        }

        return $relations;
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
                $this->syncStudentsRelation($parent, $studentsData);
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
                $this->syncStudentsRelation($parent, $studentsData);
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
                throw new BusinessException('No se puede eliminar el apoderado porque es el contacto principal de uno o más estudiantes.');
            }

            $this->logActivity('parent_deleted', $parent, [
                'document_number' => $parent->document_number,
                'full_name' => $parent->full_name,
            ]);

            $parent->students()->detach();

            $parent->delete();
        });
    }

}
