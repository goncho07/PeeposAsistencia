<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
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

    public function tenant()
    {
        return $this->belongsTo(\App\Models\Tenant::class, static::getTenantColumn());
    }


    protected static function shouldApplyTenantScope(): bool
    {
        return static::getCurrentTenantId() !== null;
    }

    protected static function shouldSetTenantId(Model $model): bool
    {
        return !$model->getAttribute(static::getTenantColumn()) && static::getCurrentTenantId();
    }

    public function scopeWithoutTenantScope(Builder $query)
    {
        return $query->withoutGlobalScope('tenant');
    }

    public function scopeForTenant(Builder $query, int $tenantId)
    {
        return $query->withoutGlobalScope('tenant')
            ->where(static::getTenantColumn(), $tenantId);
    }

    public static function getTenantColumn(): string
    {
        return 'tenant_id';
    }

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
