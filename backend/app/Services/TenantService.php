<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Tenant;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TenantService
{
    use LogsActivity;

    /**
     * Get all tenants with optional search and filters.
     */
    public function getAllTenants(?string $search = null, ?bool $isActive = null): Collection
    {
        $query = Tenant::withCount(['users', 'students', 'teachers', 'classrooms']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('modular_code', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        if ($isActive !== null) {
            $query->where('is_active', $isActive);
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Find tenant by ID.
     */
    public function findById(int $id): Tenant
    {
        return Tenant::withCount(['users', 'students', 'teachers', 'classrooms'])
            ->findOrFail($id);
    }

    /**
     * Find tenant by slug (public).
     */
    public function findBySlug(string $slug): Tenant
    {
        return Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }

    /**
     * Create a new tenant.
     */
    public function create(array $data): Tenant
    {
        $data['slug'] = Str::slug($data['name']);

        $tenant = Tenant::create($data);

        $this->logActivity('tenant_created', $tenant, [
            'name' => $tenant->name,
            'slug' => $tenant->slug,
        ]);

        return $tenant->fresh()->loadCount(['users', 'students', 'teachers', 'classrooms']);
    }

    /**
     * Update a tenant.
     */
    public function update(int $id, array $data): Tenant
    {
        $tenant = Tenant::findOrFail($id);

        $oldValues = $tenant->only(['name', 'is_active']);

        if (isset($data['name']) && $data['name'] !== $tenant->name) {
            $data['slug'] = Str::slug($data['name']);
        }

        $tenant->update($data);

        $newValues = $tenant->only(array_keys($oldValues));
        $this->logActivityWithChanges('tenant_updated', $tenant, $oldValues, $newValues);

        return $tenant->fresh()->loadCount(['users', 'students', 'teachers', 'classrooms']);
    }

    /**
     * Delete a tenant.
     *
     * @throws BusinessException if tenant has associated data
     */
    public function delete(int $id): void
    {
        $tenant = Tenant::findOrFail($id);

        $counts = [
            'users' => $tenant->users()->count(),
            'students' => $tenant->students()->count(),
            'teachers' => $tenant->teachers()->count(),
        ];

        if (array_sum($counts) > 0) {
            throw new BusinessException(
                'No se puede eliminar el tenant porque tiene datos asociados. ' .
                'Usuarios: ' . $counts['users'] . ', ' .
                'Estudiantes: ' . $counts['students'] . ', ' .
                'Docentes: ' . $counts['teachers']
            );
        }

        $this->logActivity('tenant_deleted', $tenant, [
            'name' => $tenant->name,
        ]);

        $tenant->delete();
    }

    /**
     * Toggle tenant active status.
     */
    public function toggleActive(int $id): Tenant
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => !$tenant->is_active]);

        $this->logActivity(
            $tenant->is_active ? 'tenant_activated' : 'tenant_deactivated',
            $tenant,
            ['name' => $tenant->name]
        );

        return $tenant;
    }

    /**
     * Enter tenant context for superadmin.
     *
     * @throws BusinessException if user is not superadmin
     */
    public function enterTenant(User $user, int $tenantId): Tenant
    {
        if ($user->role !== 'SUPERADMIN') {
            throw new BusinessException('Solo SUPERADMIN puede entrar a un tenant');
        }

        $tenant = Tenant::findOrFail($tenantId);
        $user->update(['tenant_id' => $tenant->id]);

        $this->logActivity('superadmin_entered_tenant', $tenant, [
            'tenant_name' => $tenant->name,
        ], $user);

        return $tenant;
    }

    /**
     * Exit tenant context for superadmin.
     *
     * @throws BusinessException if user is not superadmin
     */
    public function exitTenant(User $user): void
    {
        if ($user->role !== 'SUPERADMIN') {
            throw new BusinessException('Solo SUPERADMIN puede salir de un tenant');
        }

        $this->logActivity('superadmin_exited_tenant', null, [], $user);

        $user->update(['tenant_id' => null]);
    }

    /**
     * Upload tenant image.
     */
    public function uploadImage(Tenant $tenant, $image, string $type): string
    {
        $disk = config('filesystems.default');
        $field = "{$type}_url";

        // Delete old image if exists
        if ($tenant->$field) {
            Storage::disk($disk)->delete($tenant->$field);
        }

        // Store new image
        $path = $image->store("tenants/{$tenant->slug}", $disk);
        $tenant->update([$field => $path]);

        return $path;
    }

    /**
     * Get global stats for superadmin.
     */
    public function getGlobalStats(): array
    {
        return [
            'tenants' => [
                'total' => Tenant::count(),
                'active' => Tenant::where('is_active', true)->count(),
                'inactive' => Tenant::where('is_active', false)->count(),
            ],
            'users' => User::count(),
            'students' => \App\Models\Student::count(),
            'teachers' => \App\Models\Teacher::count(),
        ];
    }
}
