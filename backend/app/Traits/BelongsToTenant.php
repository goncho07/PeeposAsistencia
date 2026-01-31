<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot the trait: registers global scope and model events.
     *
     * Behavior:
     *   - Adds global scope to filter all queries by tenant_id
     *   - Auto-assigns tenant_id on creating if not set
     *   - Prevents changing tenant_id on updating
     */
    protected static function bootBelongsToTenant()
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (static::shouldApplyTenantScope()) {
                $table = (new static)->getTable();
                $builder->where("{$table}." . static::getTenantColumn(), static::getCurrentTenantId());
            }
        });

        static::creating(function (Model $model) {
            if (static::shouldSetTenantId($model)) {
                $model->setAttribute(static::getTenantColumn(), static::getCurrentTenantId());
            }
        });

        static::updating(function (Model $model) {
            if ($model->isDirty(static::getTenantColumn())) {
                throw new \Exception('Cannot change tenant_id of an existing record');
            }
        });
    }

    /**
     * Get the tenant that owns this model.
     */
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Tenant::class, static::getTenantColumn());
    }

    /**
     * Determine if the tenant scope should be applied.
     */
    protected static function shouldApplyTenantScope(): bool
    {
        return static::getCurrentTenantId() !== null;
    }

    /**
     * Determine if tenant_id should be auto-assigned on create.
     */
    protected static function shouldSetTenantId(Model $model): bool
    {
        return !$model->getAttribute(static::getTenantColumn()) && static::getCurrentTenantId();
    }

    /**
     * Bypass tenant filtering for this query.
     */
    public function scopeWithoutTenantScope(Builder $query)
    {
        return $query->withoutGlobalScope('tenant');
    }

    /**
     * Query records for a specific tenant (bypasses current tenant).
     */
    public function scopeForTenant(Builder $query, int $tenantId)
    {
        return $query->withoutGlobalScope('tenant')
            ->where(static::getTenantColumn(), $tenantId);
    }

    /**
     * Get the tenant column name.
     */
    public static function getTenantColumn(): string
    {
        return 'tenant_id';
    }

    /**
     * Get the current tenant ID from container or authenticated user.
     *
     * Priority:
     *   1. app('current_tenant_id') if bound (for jobs, commands, etc.)
     *   2. Auth::user()->tenant_id if authenticated
     *   3. null if neither
     */
    public static function getCurrentTenantId(): ?int
    {
        if (app()->bound('current_tenant_id')) {
            return app('current_tenant_id');
        }

        if (Auth::check() && Auth::user()->tenant_id) {
            return Auth::user()->tenant_id;
        }

        return null;
    }
}
