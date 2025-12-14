<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Traits\HasSearchableFields;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

class EloquentUserRepository implements UserRepositoryInterface
{
    use HasSearchableFields;

    public function getAll(?string $search = null): Collection
    {
        return User::query()
            ->select(['id', 'name', 'paternal_surname', 'maternal_surname', 'email', 'dni', 'phone_number', 'rol', 'status', 'avatar_url'])
            ->when($search, fn($q) => $this->applySearchFilter($q, $search, [
                'name', 'paternal_surname', 'maternal_surname', 'dni', 'email'
            ]))
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): User
    {
        return User::findOrFail($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);
        $data['password'] = Hash::make($data['password']);
        $user->update($data);
        return $user->fresh();
    }

    public function delete(int $id): bool
    {
        $user = User::findOrFail($id);
        return (bool) $user->delete();
    }

    private function applySearchFilter($query, string $search, array $fields): void
    {
        $query->where(function ($q) use ($search, $fields) {
            foreach ($fields as $field) {
                $q->orWhere($field, 'like', "%{$search}%");
            }
        });
    }
}
