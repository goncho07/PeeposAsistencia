<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    use LogsActivity;

    /**
     * Get all admin users with optional search and filters.
     *
     * @param string|null $search
     * @param string|null $role
     * @param string|null $status
     * @param array $expand Relations to expand (teacher)
     */
    public function getAllAdminUsers(
        ?string $search = null,
        ?string $role = null,
        ?string $status = null,
        array $expand = []
    ): Collection {
        $query = User::query()
            ->when($search, fn($q) => $q->search($search))
            ->when($role, fn($q) => $q->byRole($role))
            ->when($status, fn($q) => $q->byStatus($status))
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name');

        $relations = $this->buildRelationsFromExpand($expand);
        if (!empty($relations)) {
            $query->with($relations)    ;
        }

        return $query->get();
    }

    /**
     * Find admin user by ID.
     *
     * @param int $id
     * @param array $expand Relations to expand
     */
    public function findById(int $id, array $expand = []): User
    {
        $query = User::query();

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

        if (in_array('teacher', $expand)) {
            $relations[] = 'teacher';
        }

        return $relations;
    }

    /**
     * Create a new admin user
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $data['password'] = Hash::make($data['password']);

            $data['status'] = $data['status'] ?? 'ACTIVO';

            $user = User::create($data);

            $this->logActivity('user_created', $user, [
                'document_number' => $user->document_number,
                'full_name' => $user->full_name,
                'role' => $user->role,
            ]);

            return $user;
        });
    }

    /**
     * Update an existing admin user
     */
    public function update(int $id, array $data): User
    {
        return DB::transaction(function () use ($id, $data) {
            $user = User::findOrFail($id);

            $oldValues = $user->only(['document_number', 'name', 'email', 'role', 'status']);

            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            $newValues = $user->only(array_keys($oldValues));
            $this->logActivityWithChanges('user_updated', $user, $oldValues, $newValues);

            return $user;
        });
    }

    /**
     * Delete an admin user
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $user = User::findOrFail($id);

            if ($user->id === Auth::id()) {
                throw new BusinessException('No puedes eliminar tu propia cuenta.');
            }

            if ($user->role === 'SUPERADMIN') {
                throw new BusinessException('No puedes eliminar un SUPERADMIN.');
            }

            $this->logActivity('user_deleted', $user, [
                'document_number' => $user->document_number,
                'full_name' => $user->full_name,
                'role' => $user->role,
            ]);

            $user->tokens()->delete();

            $user->delete();
        });
    }
}
