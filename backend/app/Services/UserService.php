<?php

namespace App\Services;

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
     * Get all admin users with optional search and filters
     */
    public function getAllAdminUsers(?string $search = null, ?string $role = null, ?string $status = null): Collection
    {
        $query = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('document_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('paternal_surname', 'like', "%{$search}%")
                        ->orWhere('maternal_surname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, fn($q) => $q->where('role', $role))
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name');

        return $query->get();
    }

    /**
     * Find admin user by ID
     */
    public function findById(int $id): User
    {
        return User::with('teacher')->findOrFail($id);
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
                throw new \Exception('No puedes eliminar tu propia cuenta.');
            }

            if ($user->role === 'SUPERADMIN') {
                throw new \Exception('No puedes eliminar un SUPERADMIN.');
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
